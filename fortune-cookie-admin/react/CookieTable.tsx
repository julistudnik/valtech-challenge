// react/CookieTable.tsx
import React, { useState, useEffect } from 'react'
import { Table, Button, IconEdit, IconDelete } from 'vtex.styleguide'
import { useMutation } from 'react-apollo'

import CREATE_DOCUMENT from './graphql/mutations/createDocument.gql'
import UPDATE_DOCUMENT from './graphql/mutations/updateDocument.gql'
import DELETE_DOCUMENT from './graphql/mutations/deleteDocument.gql'
import CookieFormModal from './CookieFormModal'

interface Doc {
  id: string
  CookieFortune: string
}

const DATA_ENTITY = 'CF'

const CookieTable: React.FC = () => {
  const [items, setItems]             = useState<Doc[]>([])
  const [isModalOpen, setModalOpen]   = useState(false)
  const [editingDoc, setEditingDoc]   = useState<Doc | null>(null)
  const [message, setMessage]         = useState<string>()
  const [messageType, setMessageType] = useState<'success' | 'error'>()

  // GraphQL mutations
  const [createDocument] = useMutation(CREATE_DOCUMENT)
  const [updateDocument] = useMutation(UPDATE_DOCUMENT)
  const [deleteDocument] = useMutation(DELETE_DOCUMENT)

  // Fetch REST para obtener *todas* las frases: - Mejor carga/cache que GraphQL -
  const loadAll = async () => {
    try {
      const res = await fetch(
        `/api/dataentities/${DATA_ENTITY}/search?_fields=id,CookieFortune`,
        { credentials: 'same-origin',
          headers: { 'REST-Range': `resources=1-99` }
        }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Doc[] = await res.json()
      setItems(data)
    } catch (e) {
      console.error('loadAll error', e)
      setMessage('No se pudo cargar las frases')
      setMessageType('error')
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const clearMessage = () => {
    setMessage(undefined)
    setMessageType(undefined)
  }

  const openNew  = ()      => { setEditingDoc(null);    setModalOpen(true) }
  const openEdit = (row: Doc) => { setEditingDoc(row);    setModalOpen(true) }
  const closeModal = ()    => { setModalOpen(false);    setEditingDoc(null) }

  // Handlers CRUD via GraphQL:
  const handleSave = async (saved: boolean, data?: { phrase: string }) => {
    closeModal()
    if (!saved || !data) return
    try {
      if (editingDoc) {
        await updateDocument({
          variables: {
            acronym: DATA_ENTITY,
            id:      editingDoc.id,
            document:{
              fields: [
                { key: 'id',            value: editingDoc.id },
                { key: 'CookieFortune', value: data.phrase  },
              ]
            }
          }
        })
      } else {
        await createDocument({
          variables: {
            acronym:  DATA_ENTITY,
            document: {
              fields: [{ key: 'CookieFortune', value: data.phrase }],
            },
          },
        })
      }

      setMessage(editingDoc ? 'Frase editada correctamente' : 'Registro creado correctamente')
      setMessageType('success')
      await loadAll()
    } catch (e) {
      console.error('save error', e)
      setMessage('No se pudo guardar la frase')
      setMessageType('error')
    }
  }

  const handleDelete = async (row: Doc) => {
    if (!window.confirm('¿Eliminar esta frase?')) return
    try {
      await deleteDocument({
        variables: {
          acronym:    DATA_ENTITY,
          documentId: row.id,
        },
      })
      setMessage('Frase eliminada')
      setMessageType('success')
      await loadAll()
    } catch (e) {
      console.error('delete error', e)
      setMessage('No se pudo eliminar la frase')
      setMessageType('error')
    }
  }

  return (
    <>
      {message && (
        <div
          style={{
            position: 'relative',
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 4,
            color:  messageType==='success' ? '#155724' : '#721c24',
            background: messageType==='success' ? '#d4edda' : '#f8d7da',
            border: messageType==='success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
          }}
        >
          {message}
          <button
            onClick={clearMessage}
            style={{
              position: 'absolute',
              top: 4,
              right: 8,
              border: 'none',
              background: 'transparent',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: messageType==='success' ? '#155724' : '#721c24',
            }}
            aria-label="Cerrar mensaje"
          >×</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button variation="primary" onClick={openNew}>Agregar nueva frase</Button>
      </div>

      <Table
        fullWidth
        loading={false}
        items={items}
        density="low"
        emptyStateLabel="No hay frases"
        schema={{
          properties: {
            CookieFortune: { title: 'Frase' },
            actions: {
              title: '',
              width: 100,
              cellRenderer: ({ rowData }: any) => (
                <>
                  <Button icon variation="tertiary" onClick={() => openEdit(rowData)}>
                    <IconEdit />
                  </Button>
                  <Button icon variation="danger" onClick={() => handleDelete(rowData)}>
                    <IconDelete />
                  </Button>
                </>
              ),
            },
          },
        }}
      />

      {isModalOpen && (
        <CookieFormModal
          initialData={ editingDoc ? { id: editingDoc.id, phrase: editingDoc.CookieFortune } : null }
          onClose={handleSave}
        />
      )}
    </>
  )
}

export default CookieTable
