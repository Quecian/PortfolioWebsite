"use strict";
$(document).ready(function () {
  $.get("/usrgetloggedin/", function (data) {
    if (parseInt(data) === 0) {
      window.location.href = "/backend/login.html"; // or your actual login path
    }
  });
});
var usruser = 0;

var ClientBox = React.createClass({
  getInitialState: function () {
    return { data: [], viewthepage: 0 }; // Removed roles from state
  },
  loadAllowLogin: function () {
    $.ajax({
      url: "/getloggedin",
      dataType: "json",
      cache: false,
      success: function (data) {
        console.log("Received login check:", data);
        this.setState({ viewthepage: data });
        usruser = data;

        if (data === 0) {
          window.location.href = "/backend/index.html";
        } else {
          console.log("Access granted for user: ", data);
          this.loadClientsFromServer();
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  loadClientsFromServer: function () {
    $.ajax({
      url: "/getclients",
      data: {
        qc_clientfirstname: qc_clientfirstname.value,
        qc_clientlastname: qc_clientlastname.value,
        qc_clientphone: qc_clientphone.value,
        qc_clientemail: qc_clientemail.value,
        qc_clientaddress: qc_clientaddress.value,
        qc_clientzip: qc_clientzip.value,
      },
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  componentDidMount: function () {
    this.loadAllowLogin();
    this.loadClientsFromServer();
  },

  handleChange: function (event) {
    this.setState({
      [event.target.id]: event.target.value,
    });
  },

  render: function () {
    if (this.state.viewthepage == 0) {
      return <div>You do not have access to this page.</div>;
    } else {
      return (
        <div>
          <h1>Clients</h1>
          <ClientForm onClientSearch={this.loadClientsFromServer} />
          <br />
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>ZIP Code</th>
              </tr>
            </thead>
            <ClientList data={this.state.data} />
          </table>
        </div>
      );
    }
  },
});

var ClientForm = React.createClass({
  getInitialState: function () {
    return {
      qc_clientfirstname: "",
      qc_clientlastname: "",
      qc_clientphone: "",
      qc_clientemail: "",
      qc_clientaddress: "",
      qc_clientzip: "",
    };
  },

  handleSubmit: function (e) {
    e.preventDefault();
    this.props.onClientSearch({
      qc_clientfirstname: this.state.qc_clientfirstname,
      qc_clientlastname: this.state.qc_clientlastname,
      qc_clientphone: this.state.qc_clientphone,
      qc_clientemail: this.state.qc_clientemail,
      qc_clientaddress: this.state.qc_clientaddress,
      qc_clientzip: this.state.qc_clientzip,
    });
  },

  handleChange: function (event) {
    this.setState({
      [event.target.id]: event.target.value,
    });
  },

  render: function () {
    return (
      <form onSubmit={this.handleSubmit}>
        <h2>Search Clients</h2>
        <table>
          <tbody>
            <tr>
              <th>First Name</th>
              <td>
                <input
                  type="text"
                  name="qc_clientfirstname"
                  id="qc_clientfirstname"
                  value={this.state.qc_clientfirstname}
                  onChange={this.handleChange}
                  placeholder="First Name"
                />
              </td>
            </tr>
            <tr>
              <th>Last Name</th>
              <td>
                <input
                  type="text"
                  name="qc_clientlastname"
                  id="qc_clientlastname"
                  value={this.state.qc_clientlastname}
                  onChange={this.handleChange}
                  placeholder="Last Name"
                />
              </td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>
                <input
                  type="text"
                  name="qc_clientphone"
                  id="qc_clientphone"
                  value={this.state.qc_clientphone}
                  onChange={this.handleChange}
                  placeholder="Phone (Optional)"
                />
              </td>
            </tr>
            <tr>
              <th>Email</th>
              <td>
                <input
                  type="email"
                  name="qc_clientemail"
                  id="qc_clientemail"
                  value={this.state.qc_clientemail}
                  onChange={this.handleChange}
                  placeholder="Email (Optional)"
                />
              </td>
            </tr>
            <tr>
              <th>Address</th>
              <td>
                <input
                  type="text"
                  name="qc_clientaddress"
                  id="qc_clientaddress"
                  value={this.state.qc_clientaddress}
                  onChange={this.handleChange}
                  placeholder="Address (Optional)"
                />
              </td>
            </tr>
            <tr>
              <th>ZIP Code</th>
              <td>
                <input
                  type="text"
                  name="qc_clientzip"
                  id="qc_clientzip"
                  value={this.state.qc_clientzip}
                  onChange={this.handleChange}
                  placeholder="ZIP Code (Optional)"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Search Clients" />
      </form>
    );
  },
});

var ClientList = React.createClass({
  render: function () {
    var clientNodes = this.props.data.map(function (client) {
      return (
        <tr key={client.qc_clientid}>
          <td>{client.qc_clientfirstname}</td>
          <td>{client.qc_clientlastname}</td>
          <td>{client.qc_clientphone}</td>
          <td>{client.qc_clientemail}</td>
          <td>{client.qc_clientaddress}</td>
          <td>{client.qc_clientzip}</td>
        </tr>
      );
    });

    return <tbody>{clientNodes}</tbody>;
  },
});

ReactDOM.render(<ClientBox />, document.getElementById("content"));
