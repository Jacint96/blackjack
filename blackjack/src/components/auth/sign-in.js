import React, { useRef, useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { Link, useHistory } from 'react-router-dom'

export default function Login() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const { login } = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const history = useHistory()

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            setError('')
            setLoading(true)
            await login(emailRef.current.value, passwordRef.current.value)
            history.push("/")
        } catch {
            setError('Sikertelen bejelentkezés')
        }
        setLoading(false)
    }

    return (
        <>
            <Card className="border-0">
                <Card.Body>
                    <h2 className="text-center mb-4">Bejelentkezés</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required />
                        </Form.Group>
                        <Form.Group id="password">
                            <Form.Label>Jelszó</Form.Label>
                            <Form.Control type="password" ref={passwordRef} required />
                        </Form.Group>
                        <Button disabled={loading} className="w-100" type="submit">Bejelentkezés</Button>
                    </Form>
                </Card.Body>
                <div className="w-100 text-center mt-3">
                    <Link to="/forgot-password">Elfelejtetted a jelszavad?</Link>
                </div>
            </Card>
            <div className="w-100 text-center mt-2">
                <Link to="/signup">Regisztrálj most</Link>
            </div>
        </>
    )
}
