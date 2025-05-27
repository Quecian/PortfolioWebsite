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
    return { data: [], viewthepage: 0 };
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

  updateSingleClientFromServer: function (client) {
    $.ajax({
      url: "/updatesingleclient",
      dataType: "json",
      data: client,
      type: "POST",
      cache: false,
      success: function (upsingledata) {
        this.setState({ upsingledata: upsingledata });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
    window.location.reload(true);
  },

  componentDidMount: function () {
    this.loadAllowLogin();
    this.loadClientsFromServer();
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
          <div id="theclients">
            <div id="theleft">
              <table>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th></th>
                  </tr>
                </thead>
                <ClientList data={this.state.data} />
              </table>
            </div>
            <div id="theright">
              <ClientUpdateForm
                onUpdateSubmit={this.updateSingleClientFromServer}
              />
            </div>
          </div>
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
    this.props.onClientSearch();
  },

  handleChange: function (event) {
    this.setState({
      [event.target.id]: event.target.value,
    });
  },

  render: function () {
    return (
      <div id="theform">
        <form onSubmit={this.handleSubmit}>
          <h2>Clients</h2>
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
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <input type="submit" value="Search Clients" />
        </form>
      </div>
    );
  },
});

var ClientUpdateForm = React.createClass({
  handleUpSubmit: function (e) {
    e.preventDefault();

    this.props.onUpdateSubmit({
      qc_UPclientid: qc_UPclientid.value,
      qc_UPclientlastname: qc_UPclientlastname.value,
      qc_UPclientfirstname: qc_UPclientfirstname.value,
      qc_UPclientphone: qc_UPclientphone.value,
      qc_UPclientemail: qc_UPclientemail.value,
      qc_UPclientaddress: qc_UPclientaddress.value,
      qc_UPclientzip: qc_UPclientzip.value,
    });
  },

  render: function () {
    return (
      <div id="theform">
        <form onSubmit={this.handleUpSubmit}>
          <table>
            <tbody>
              <tr>
                <th>First Name</th>
                <td>
                  <input
                    type="text"
                    name="qc_UPclientfirstname"
                    id="qc_UPclientfirstname"
                  />
                </td>
              </tr>
              <tr>
                <th>Last Name</th>
                <td>
                  <input
                    type="text"
                    name="qc_UPclientlastname"
                    id="qc_UPclientlastname"
                  />
                </td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>
                  <input
                    type="text"
                    name="qc_UPclientphone"
                    id="qc_UPclientphone"
                  />
                </td>
              </tr>
              <tr>
                <th>Email</th>
                <td>
                  <input
                    type="email"
                    name="qc_UPclientemail"
                    id="qc_UPclientemail"
                  />
                </td>
              </tr>
              <tr>
                <th>Address</th>
                <td>
                  <input
                    type="text"
                    name="qc_UPclientaddress"
                    id="qc_UPclientaddress"
                  />
                </td>
              </tr>
              <tr>
                <th>ZIP Code</th>
                <td>
                  <input
                    type="text"
                    name="qc_UPclientzip"
                    id="qc_UPclientzip"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <input type="hidden" name="qc_UPclientid" id="qc_UPclientid" />
          <input type="submit" value="Update Client" />
        </form>
      </div>
    );
  },
});

var ClientList = React.createClass({
  render: function () {
    var clientNodes = this.props.data.map(function (client) {
      return (
        <Client
          key={client.qc_clientid}
          qc_clientid={client.qc_clientid}
          qc_clientfirstname={client.qc_clientfirstname}
          qc_clientlastname={client.qc_clientlastname}
          qc_clientemail={client.qc_clientemail}
        ></Client>
      );
    });
    return <tbody>{clientNodes}</tbody>;
  },
});

var Client = React.createClass({
  getInitialState: function () {
    return {
      qc_upclientkey: "",
      singledata: [],
    };
  },

  updateRecord: function (e) {
    e.preventDefault();
    var qc_theupclientkey = this.props.qc_clientid;
    this.loadSingleClient(qc_theupclientkey);
  },

  loadSingleClient: function (qc_theupclientkey) {
    $.ajax({
      url: "/getsingleclient",
      data: { qc_upclientkey: qc_theupclientkey },
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ singledata: data });
        var populateClient = this.state.singledata.map(function (client) {
          qc_UPclientid.value = qc_theupclientkey;
          qc_UPclientfirstname.value = client.qc_clientfirstname;
          qc_UPclientlastname.value = client.qc_clientlastname;
          qc_UPclientphone.value = client.qc_clientphone;
          qc_UPclientemail.value = client.qc_clientemail;
          qc_UPclientaddress.value = client.qc_clientaddress;
          qc_UPclientzip.value = client.qc_clientzip;
        });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  render: function () {
    return (
      <tr>
        <td>{this.props.qc_clientid}</td>
        <td>{this.props.qc_clientfirstname}</td>
        <td>{this.props.qc_clientlastname}</td>
        <td>{this.props.qc_clientemail}</td>
        <td>
          <form onSubmit={this.updateRecord}>
            <input type="submit" value="Update Record" />
          </form>
        </td>
      </tr>
    );
  },
});

ReactDOM.render(<ClientBox />, document.getElementById("content"));
