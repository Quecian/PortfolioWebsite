"use strict";

function formatDateOnly(datetimeString) {
  return new Date(datetimeString).toISOString().split("T")[0];
}
var usruser = 0;

var AppointmentBox = React.createClass({
  getInitialState: function () {
    return { data: [], users: [], clients: [], services: [], viewthepage: 0 };
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
          this.loadAppointmentsFromServer();
          this.loadAppointmentsFromServer(); // This will attempt to run on page load
          this.loadUsersFromServer();
          this.loadClientsFromServer();
          this.loadServicesFromServer();
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  loadAppointmentsFromServer: function () {
    $.ajax({
      url: "/getappointments",
      data: {
        qc_apptdate: qc_apptdate.value,
        qc_appttime: qc_appttime.value,
        qc_apptlength: qc_apptlength.value,
        qc_apptuserid: qc_apptuserid.value,
        qc_apptclientid: qc_apptclientid.value,
        qc_apptserviceid: qc_apptserviceid.value,
      },
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getappointments", status, err.toString());
      }.bind(this),
    });
  },

  loadUsersFromServer: function () {
    $.ajax({
      url: "/getusertypes",
      dataType: "json",
      cache: false,
      success: function (users) {
        this.setState({ users: users });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getusertypes", status, err.toString());
      }.bind(this),
    });
  },

  loadClientsFromServer: function () {
    $.ajax({
      url: "/getclienttypes",
      dataType: "json",
      cache: false,
      success: function (clients) {
        this.setState({ clients: clients });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getclienttypes", status, err.toString());
      }.bind(this),
    });
  },

  loadServicesFromServer: function () {
    $.ajax({
      url: "/getservicetypes",
      dataType: "json",
      cache: false,
      success: function (services) {
        this.setState({ services: services });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getservicetypes", status, err.toString());
      }.bind(this),
    });
  },

  componentDidMount: function () {
    this.loadAllowLogin();
    this.loadAppointmentsFromServer(); // This will attempt to run on page load
    this.loadUsersFromServer();
    this.loadClientsFromServer();
    this.loadServicesFromServer();
  },

  render: function () {
    if (this.state.viewthepage == 0) {
      return <div>You do not have access to this page.</div>;
    } else {
      return (
        <div>
          <h1>Search Appointments</h1>
          <AppointmentForm
            onAppointmentSubmit={this.loadAppointmentsFromServer}
            users={this.state.users}
            clients={this.state.clients}
            services={this.state.services}
          />
          <br />
          <table>
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Length</th>
                <th>User ID</th>
                <th>Client ID</th>
                <th>Service ID</th>
              </tr>
            </thead>
            <AppointmentList data={this.state.data} />
          </table>
        </div>
      );
    }
  },
});

var AppointmentForm = React.createClass({
  getInitialState: function () {
    return {
      qc_apptdate: "",
      qc_appttime: "",
      qc_apptlength: "",
      qc_apptuserid: "",
      qc_apptclientid: "",
      qc_apptserviceid: "",
    };
  },

  handleSubmit: function (e) {
    e.preventDefault();
    this.props.onAppointmentSubmit({
      qc_apptdate: this.state.qc_apptdate,
      qc_appttime: this.state.qc_appttime,
      qc_apptlength: this.state.qc_apptlength,
      qc_apptuserid: this.state.qc_apptuserid,
      qc_apptclientid: this.state.qc_apptclientid,
      qc_apptserviceid: this.state.qc_apptserviceid,
    });
  },

  handleChange: function (event) {
    this.setState({ [event.target.id]: event.target.value });
  },

  render: function () {
    return (
      <form onSubmit={this.handleSubmit}>
        <table>
          <tbody>
            <tr>
              <th>Date</th>
              <td>
                <input
                  type="date"
                  id="qc_apptdate"
                  value={this.state.qc_apptdate}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Time</th>
              <td>
                <input
                  type="time"
                  id="qc_appttime"
                  value={this.state.qc_appttime}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Length</th>
              <td>
                <input
                  type="number"
                  step="0.25"
                  id="qc_apptlength"
                  value={this.state.qc_apptlength}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>User</th>
              <td>
                <UserDropdown
                  id="qc_apptuserid"
                  value={this.state.qc_apptuserid}
                  onChange={this.handleChange}
                  users={this.props.users}
                />
              </td>
            </tr>
            <tr>
              <th>Client</th>
              <td>
                <ClientDropdown
                  id="qc_apptclientid"
                  value={this.state.qc_apptclientid}
                  onChange={this.handleChange}
                  clients={this.props.clients}
                />
              </td>
            </tr>
            <tr>
              <th>Service</th>
              <td>
                <ServiceDropdown
                  id="qc_apptserviceid"
                  value={this.state.qc_apptserviceid}
                  onChange={this.handleChange}
                  services={this.props.services}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Search" />
      </form>
    );
  },
});

var AppointmentList = React.createClass({
  render: function () {
    var appointmentNodes = this.props.data.map(function (appointment) {
      return (
        <tr key={appointment.qc_apptid}>
          <td>{appointment.qc_apptid}</td>
          <td>{formatDateOnly(appointment.qc_apptdate)}</td>
          <td>{appointment.qc_appttime}</td>
          <td>{appointment.qc_apptlength}</td>
          <td>{appointment.qc_apptuserid}</td>
          <td>{appointment.qc_apptclientid}</td>
          <td>{appointment.qc_apptserviceid}</td>
        </tr>
      );
    });

    return <tbody>{appointmentNodes}</tbody>;
  },
});

var UserDropdown = React.createClass({
  render: function () {
    var options = this.props.users.map(function (user) {
      return (
        <option key={user.qc_userid} value={user.qc_userid}>
          {user.qc_username}
        </option>
      );
    });
    return (
      <select
        id={this.props.id}
        value={this.props.value}
        onChange={this.props.onChange}
      >
        <option value="">Select User</option>
        {options}
      </select>
    );
  },
});

var ClientDropdown = React.createClass({
  render: function () {
    var options = this.props.clients.map(function (client) {
      return (
        <option key={client.qc_clientid} value={client.qc_clientid}>
          {client.qc_clientfirstname}
        </option>
      );
    });
    return (
      <select
        id={this.props.id}
        value={this.props.value}
        onChange={this.props.onChange}
      >
        <option value="">Select Client</option>
        {options}
      </select>
    );
  },
});

var ServiceDropdown = React.createClass({
  render: function () {
    var options = this.props.services.map(function (service) {
      return (
        <option key={service.qc_serviceid} value={service.qc_serviceid}>
          {service.qc_servicename}
        </option>
      );
    });
    return (
      <select
        id={this.props.id}
        value={this.props.value}
        onChange={this.props.onChange}
      >
        <option value="">Select Service</option>
        {options}
      </select>
    );
  },
});

ReactDOM.render(<AppointmentBox />, document.getElementById("content"));
