'use client'
import { useCallback, useEffect, useRef } from 'react'
import styles from "./modal.module.css"

type Props = {
  onClose: () => void
  body: React.ReactElement
  header: string
}

const Modal = ({ onClose, body, header }: Props) => {

  const modalRef = useRef<HTMLDivElement>(null)
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      modalRef.current &&
      event.target instanceof Node &&
      !modalRef.current.contains(event.target)
    ) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <div className={styles.modal} ref={modalRef}>
     <div className={styles.modalbody}>
      <div className={styles.modalHeader}>
        <h3>{header}</h3>
        <span onClick={onClose}>x</span>
      </div>
      {body}
     </div>
    </div>
  )
}

export default Modal