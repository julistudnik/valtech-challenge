import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-apollo'
import { Table, Button, IconEdit, IconDelete } from 'vtex.styleguide'
import GET_DOCUMENTS from './graphql/queries/getDocuments.gql'
import CookieFormModal from './CookieFormModal'

interface Doc {
    id: string
    CookieFortune: string
}

const DATA_ENTITY = 'CF'
const PAGE_SIZE = 50

const CookieTable: React.FC = () => {
  const [items, setItems]               = useState<Doc[]>([])
  const [page, setPage]                 = useState(1)
  const [isModalOpen, setModalOpen]     = useState(false)
  const [editingDoc, setEditingDoc]     = useState<Doc | null>(null)
  const [message, setMessage]           = useState<string | undefined>()
  const [messageType, setMessageType]   = useState<'success' | 'error' | undefined>()

  /* ---------- GraphQL: obtener frases ---------- */
  const { data, loading, error, refetch } = useQuery(GET_DOCUMENTS, {
    variables: {
      acronym: 'CF',
      fields: ['id', 'CookieFortune'],
      page,
      pageSize: PAGE_SIZE,
    },
    fetchPolicy : 'no-cache',   
  })

  /* ---------- volcar data al estado ---------- */
  useEffect(() => {
    console.log("data? ", data)
    if (data?.documents) {
      const docs: Doc[] = data.documents.map((d: any) => ({
        id: d.id,
        CookieFortune: (d.fields.find((f: any) => f.key === 'CookieFortune') || {}).value || '',
      }))
      console.log("docs: ", docs)
      setItems(docs)
    }
  }, [data])

  /* ---------- helpers UI ---------- */
  const clearMessage = () => {
    setMessage(undefined)
    setMessageType(undefined)
  }

  const openNew  = () => { setEditingDoc(null);setModalOpen(true)  }
  const openEdit = (row: Doc) => { setEditingDoc(row);setModalOpen(true)  }
  const closeModal = () => { setModalOpen(false); setEditingDoc(null) }

  /* ---------- CRUD via fetch ---------- */
  const saveDoc = async (payload: { phrase: string }, editing?: Doc | null) => {
    const url    = editing
      ? `/api/dataentities/${DATA_ENTITY}/documents/${editing.id}`
      : `/api/dataentities/${DATA_ENTITY}/documents`
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ CookieFortune: payload.phrase }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  }

  const deleteDoc = async (row: Doc) => {
    const res = await fetch(
      `/api/dataentities/${DATA_ENTITY}/documents/${row.id}`,
      { method: 'DELETE', credentials: 'same-origin' }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  }
    /* ---------- handlers ---------- */
  const handleSave = async (saved: boolean, data?: { phrase: string }) => {
    closeModal()
    if (!saved || !data) return
    try {
      await saveDoc(data, editingDoc)
      setItems(prev =>
        editingDoc
          ? prev.map(i =>
              i.id === editingDoc.id ? { ...i, CookieFortune: data.phrase } : i
            )
          : [{ id: Date.now().toString(), CookieFortune: data.phrase }, ...prev]
      )
      setMessage(editingDoc ? 'Frase editada correctamente' : 'Registro creado correctamente')
      setMessageType('success')
      await refetch()
    } catch (e) {
      console.error('save error', e)
      setMessage('No se pudo guardar la frase')
      setMessageType('error')
    }
  }

   const handleDelete = async (row: Doc) => {
    if (!window.confirm('¿Eliminar esta frase?')) return
    try {
      await deleteDoc(row)
      setItems(prev => prev.filter(i => i.id !== row.id))
      setMessage('Frase eliminada')
      setMessageType('success')
      if (items.length === 1 && page > 1) {
        prevPage()
      } else {
        await refetch()
      }
    } catch (e) {
      console.error('delete error', e)
      setMessage('No se pudo eliminar la frase')
      setMessageType('error')
    }
  }
  const nextPage = () => {
    const p = page + 1
    setPage(p)
    refetch({ page: p, pageSize: PAGE_SIZE, acronym: 'CF', fields: ['id','CookieFortune'] })
  }

  const prevPage = () => {
    const p = Math.max(1, page - 1)
    setPage(p)
    refetch({ page: p, pageSize: PAGE_SIZE, acronym: 'CF', fields: ['id','CookieFortune'] })
  }

  /* ---------- render ---------- */
  if (error) return <div style={{ color: 'red' }}>Error al cargar</div>

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
              lineHeight: 1,
              cursor: 'pointer',
              color: messageType==='success' ? '#155724' : '#721c24',
            }}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button variation="primary" onClick={openNew}>
          Agregar nueva frase
        </Button>
      </div>

      <Table
        fullWidth
        loading={loading}
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

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <Button onClick={prevPage} disabled={page === 1}>
          ← Anterior
        </Button>
        <span>Página {page}</span>
        <Button onClick={nextPage} disabled={items.length < PAGE_SIZE}>
          Siguiente →
        </Button>
      </div>

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
