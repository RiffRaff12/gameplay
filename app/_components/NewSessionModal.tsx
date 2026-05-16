'use client'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import SessionForm from '@/app/sessions/_components/SessionForm'

type CreateState = { success: boolean; error?: string } | null
type CreateAction = (prevState: CreateState, formData: FormData) => Promise<CreateState>

type ModalFormProps = {
  action: CreateAction
  onSuccess: () => void
  onCancel: () => void
}

function ModalForm({ action, onSuccess, onCancel }: ModalFormProps) {
  const [state, formAction] = useActionState(action, null)

  useEffect(() => {
    if (state?.success) onSuccess()
  }, [state?.success])

  return (
    <>
      {state && !state.success && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <SessionForm
        action={formAction as (formData: FormData) => void}
        submitLabel="Create Session"
        onCancel={onCancel}
      />
    </>
  )
}

type Props = {
  action: CreateAction
}

export default function NewSessionModal({ action }: Props) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const router = useRouter()

  function handleOpen() {
    setFormKey(k => k + 1)
    setOpen(true)
  }

  function handleSuccess() {
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
      >
        New Session
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">New Session</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <ModalForm
              key={formKey}
              action={action}
              onSuccess={handleSuccess}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
