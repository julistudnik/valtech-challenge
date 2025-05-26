import React, { useState } from 'react'
import { ModalDialog, Input } from 'vtex.styleguide'

interface Props {
    initialData: { id?: string; phrase?: string } | null
    onClose: (saved: boolean, data?: { phrase: string }) => void
}

const CookieFormModal: React.FC<Props> = ({ initialData, onClose }) => {
    const [phrase, setPhrase] = useState(initialData?.phrase ?? '')
    const isEdit = Boolean(initialData?.id)

    const save = () => {
        onClose(true, { phrase })
    }

    return (
        <ModalDialog
            centered
            isOpen
            confirmation={{
                label: isEdit ? 'Editar' : 'Agregar',
                onClick: save,
            }}
            cancelation={{
                label: 'Cancelar',
                onClick: () => onClose(false),
            }}
        >
            <h3>{isEdit ? 'Editar frase' : 'Agregar nueva frase'}</h3>
            <Input
                value={phrase}
                onChange={(e: any) => setPhrase(e.target.value)}
                placeholder="Escribe la frase aquí"
                block
                autoFocus
            />
        </ModalDialog>
    )
}

export default CookieFormModal
