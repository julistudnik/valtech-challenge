import React, { Component } from 'react'
import { Table, Button, IconEdit, IconDelete } from 'vtex.styleguide'

import CookieFormModal from './CookieFormModal'

interface Doc {
    id: string
    CookieFortune: string
}

const DATA_ENTITY = 'CF'

interface State {
    items: Doc[]
    tableDensity: 'low' | 'medium' | 'high'
    error?: string
    isModalOpen: boolean
    message?: string
    messageType?: 'success' | 'error'
    editingDoc: Doc | null
}

class CookieTable extends Component<Record<string, unknown>, State> {
    state: State = {
        items: [],
        tableDensity: 'low',
        error: undefined,
        isModalOpen: false,
        message: undefined,
        messageType: undefined,
        editingDoc: null,
    }

    componentDidMount() {
        this.loadData()
    }

    private loadData = async () => {
        try {
            const url =
                `/api/dataentities/${DATA_ENTITY}/search?_fields=id,CookieFortune&_size=100`
            const res = await fetch(url, { credentials: 'same-origin' })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data: Doc[] = await res.json()
            this.setState({ items: data })
        } catch (err) {
            const message = (err as Error).message || 'Fetch error'
            this.setState({
                error: message,
                message: 'No se pudo cargar las frases',
                messageType: 'error',
            })
            console.error('CookieTable → fetch error', err)
        }
    }

    private openModal = (doc?: Doc) => {
        this.setState({
            isModalOpen: true,
            editingDoc: doc || null,
            message: undefined,
            messageType: undefined,
        })
    }

    private clearMessage = () => {
        this.setState({ message: undefined, messageType: undefined })
    }

    private handleSave = async (saved: boolean, data?: { phrase: string }) => {
        this.setState({ isModalOpen: false })
        if (!saved || !data) return

        const { editingDoc } = this.state
        try {
            const url = editingDoc
                ? `/api/dataentities/${DATA_ENTITY}/documents/${editingDoc.id}`
                : `/api/dataentities/${DATA_ENTITY}/documents`
            const method = editingDoc ? 'PATCH' : 'POST'
            const res = await fetch(url, {
                method,
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ CookieFortune: data.phrase }),
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)

            this.setState({
                message: editingDoc
                    ? 'Frase editada correctamente'
                    : 'Registro creado correctamente',
                messageType: 'success',
                editingDoc: null,
            })
            this.loadData()
        } catch (err) {
            console.error('CookieTable → save error', err)
            this.setState({ message: 'No se pudo guardar la frase', messageType: 'error' })
        }
    }

    private handleDelete = async (doc: Doc) => {
        if (!window.confirm('¿Eliminar esta frase?')) return
        try {
            const res = await fetch(
                `/api/dataentities/${DATA_ENTITY}/documents/${doc.id}`,
                { method: 'DELETE', credentials: 'same-origin' }
            )
            if (!res.ok) throw new Error(`HTTP ${res.status}`)

            this.setState({ message: 'Frase eliminada', messageType: 'success' })
            this.loadData()
        } catch (err) {
            console.error('CookieTable → delete error', err)
            this.setState({ message: 'No se pudo eliminar la frase', messageType: 'error' })
        }
    }

    private getSchema() {
        return {
            properties: {
                CookieFortune: {
                    title: 'Frase',
                    cellRenderer: ({ cellData }: any) => (
                        <span className="ws-normal">{cellData}</span>
                    ),
                },
                actions: {
                    title: '',
                    width: 100,
                    cellRenderer: ({ rowData }: any) => (
                        <>
                            <Button
                                icon
                                variation="tertiary"
                                onClick={() => this.openModal(rowData)}
                            >
                                <IconEdit />
                            </Button>
                            <Button
                                icon
                                variation="danger"
                                onClick={() => this.handleDelete(rowData)}
                            >
                                <IconDelete />
                            </Button>
                        </>
                    ),
                },
            },
        }
    }

    render() {
        const {
            items,
            tableDensity,
            error,
            isModalOpen,
            message,
            messageType,
            editingDoc,
        } = this.state

        if (error) {
            return <div style={{ color: 'red' }}>Error: {error}</div>
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
                            color: messageType === 'success' ? '#155724' : '#721c24',
                            background: messageType === 'success' ? '#d4edda' : '#f8d7da',
                            border: messageType === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                        }}
                    >
                        {message}
                        <button
                            onClick={this.clearMessage}
                            style={{
                                position: 'absolute',
                                top: 4,
                                right: 8,
                                border: 'none',
                                background: 'transparent',
                                fontSize: '1.2rem',
                                lineHeight: 1,
                                cursor: 'pointer',
                                color: messageType === 'success' ? '#155724' : '#721c24',
                            }}
                            aria-label="Cerrar mensaje"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <Button variation="primary" onClick={() => this.openModal()}>
                        Agregar nueva frase
                    </Button>
                </div>

                <Table
                    fullWidth
                    updateTableKey={tableDensity}
                    items={items}
                    schema={this.getSchema()}
                    density="low"
                    emptyStateLabel="No hay frases"
                />

                {isModalOpen && (
                    <CookieFormModal
                        initialData={
                            editingDoc
                                ? { id: editingDoc.id, phrase: editingDoc.CookieFortune }
                                : null
                        }
                        onClose={this.handleSave}
                    />
                )}
            </>
        )
    }
}

export default CookieTable
