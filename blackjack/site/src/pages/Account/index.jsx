import React from 'react'
import numeral from 'numeral'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import Input from '../../components/Input'

import styles from './Account.module.scss'

class Account extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      balance: 0,
      passwordChangeSuccess: null
    }
    this.handleChangePassword = this.handleChangePassword.bind(this)
    this.handleTopup = this.handleTopup.bind(this)
  }

  componentDidMount() {
    fetch(`${process.env.REACT_APP_API_BASE}/api/identity/balance`, {
      headers: {
        Authorization: this.props.token,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Response was not ok");
        return response.json();
      })
      .then(
        (body) =>
          new Promise((resolve, reject) => {
            fetch(
              `${process.env.REACT_APP_API_BASE}/api/identity/credentials`,
              { headers: { Authorization: this.props.token } }
            )
              .then((response) => resolve([body.balance, response]))
              .catch((e) => reject(e));
          })
      )
      .then(([balance, response]) => {
        if (!response.ok) throw new Error("Second response was not ok");
        return new Promise((resolve, reject) => {
          response
            .json()
            .then((data) => resolve([balance, data]))
            .catch((e) => reject(e));
        });
      })
      .then(([balance, userData]) => {
        this.setState({
          balance,
          name: userData.name,
          email: userData.email,
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }

  handleChangePassword(e) {
    e.preventDefault()
    const form = new FormData(e.target)

    fetch(`${process.env.REACT_APP_API_BASE}/api/identity/password/change`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.token
      },
      body: JSON.stringify({
        password: form.get('password'),
        newPassword: form.get('newPassword')
      })
    }).then(response => {
      if (response.ok) {
        this.setState({ passwordChangeSuccess: true })
      }
    })
  }

  handleTopup() {
    fetch(`${process.env.REACT_APP_API_BASE}/api/identity/topup`, {
      headers: {
        Authorization: this.props.token
      }
    }).then(response => {
      if (response.ok) {
        response.json().then(body => {
          this.setState({
            balance: body.balance
          })
        })
      }
    })
  }

  render() {
    const { name, email, balance, passwordChangeSuccess } = this.state
    return (
      <Layout title="Account" balance={balance}>
        <h1 className={styles.Heading}>Welcome, {name}</h1>
        <hr />
        <h2 className={styles.Subheading}>
          <span>({email})</span>
        </h2>

        <h2 className={styles.Subheading}>Balance</h2>
        <p className={styles.Balance}>
          <span>{numeral(balance).format('0,0')}$</span>
        </p>
        <div className={styles.ButtonGroup}>
          <Button onClick={this.handleTopup}>Top-up</Button>
        </div>

        <h2 className={styles.Subheading}>Change password</h2>
        <form onSubmit={this.handleChangePassword}>
          <Input type="password" name="password" label="Password" required />
          <Input
            type="password"
            name="newPassword"
            label="New password"
            required
          />
          <Button>Change</Button>
          {passwordChangeSuccess && (
            <p className={styles.SuccessPrompt}>
              Password was updated successfully.
            </p>
          )}
        </form>
      </Layout>
    )
  }
}

export default Account
