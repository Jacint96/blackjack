import React, { useRef, useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
    const emailRef = useRef()
    const { resetPassword } = useAuth()
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            setMessage("")
            setError("")
            setLoading(true)
            await resetPassword(emailRef.current.value)
            setMessage("A jelszó helyreállító e-mailt a megadott címre elküldtük")
        } catch {
            setError('Sikertelen jelszó visszaállítás')
        }
        setLoading(false)
    }

    return (
        <>
            <Card className="border-0">
                <Card.Body>
                    <h2 className="text-center mb-4">Jelszó visszaállítása</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {message && <Alert variant="success">{message}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required />
                        </Form.Group>
                        <Button disabled={loading} className="w-100" type="submit">Küldés</Button>
                    </Form>
                </Card.Body>
                <div className="w-100 text-center mt-3">
                    <Link to="/login">Bejelentkezés</Link>
                </div>
            </Card>
            <div className="w-100 text-center mt-2">
                <Link to="/signup">Regisztrálj most</Link>
            </div>
        </>
    )
}
