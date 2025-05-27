"use strict";
$(document).ready(function () {
  $.get("/usrgetloggedin/", function (data) {
    if (parseInt(data) === 0) {
      window.location.href = "/backend/login.html"; // or your actual login path
    }
  });
});

function formatDateOnly(datetimeString) {
  return new Date(datetimeString).toISOString().split("T")[0];
};
var usruser = 0;

var AppointmentBox = React.createClass({
  getInitialState: function () {
    return {
      data: [],
      users: [],
      clients: [],
      services: [],
      upusers: [],
      upclients: [],
      upservices: [],
      viewthepage: 0
    };
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
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  updateSingleAppointmentFromServer: function (appointment) {
    $.ajax({
      url: "/updatesingleappointment",
      dataType: "json",
      data: appointment,
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
      url: "/getclienttypes", // New endpoint to get clients for dropdown
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
      url: "/getservicetypes", // New endpoint to get services for dropdown
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
    this.loadAppointmentsFromServer();
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
        <h1>Appointments</h1>
        <AppointmentForm
          onAppointmentSubmit={this.loadAppointmentsFromServer}
          users={this.state.users}
          clients={this.state.clients}
          services={this.state.services}
        />
        <br />
        <div id="theappointments">
          <div id="theleft">
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
                  <th></th>
                </tr>
              </thead>
              <AppointmentList
                data={this.state.data}
                onAppointmentSelect={this.loadSingleAppointmentFromServer}
              />
            </table>
          </div>
          <div id="theright">
            <h2>Update Appointment</h2>
            <AppointmentUpdateForm
              onUpdateSubmit={this.updateSingleAppointmentFromServer}
              upusers={this.state.users}
              upclients={this.state.clients}
              upservices={this.state.services}
            />
          </div>
        </div>
      </div>
    );
  }},
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
      qc_apptnotes: "",
      data: [],
      users: [],
      clients: [],
      services: [],
    };
  },

  handleSubmit: function (e) {
    e.preventDefault();
    var qc_apptdate = this.state.qc_apptdate;
    var qc_appttime = this.state.qc_appttime;
    var qc_apptlength = this.state.qc_apptlength;
    var qc_apptuserid = this.state.qc_apptuserid;
    var qc_apptclientid = this.state.qc_apptclientid;
    var qc_apptserviceid = this.state.qc_apptserviceid;
    var qc_apptnotes = this.state.qc_apptnotes;

    this.props.onAppointmentSubmit({
      qc_appttime: qc_appttime,
      qc_apptdate: qc_apptdate,
      qc_apptlength: qc_apptlength,
      qc_apptuserid: qc_apptuserid,
      qc_apptclientid: qc_apptclientid,
      qc_apptserviceid: qc_apptserviceid,
      qc_apptnotes: qc_apptnotes,
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
        <table>
          <tbody>
            <tr>
              <th>Appointment Date</th>
              <td>
                <input
                  type="date"
                  name="qc_apptdate"
                  id="qc_apptdate"
                  value={this.state.qc_apptdate}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Appointment Time</th>
              <td>
                <input
                  type="time"
                  name="qc_appttime"
                  id="qc_appttime"
                  value={this.state.qc_appttime}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Appointment Length</th>
              <td>
                <input
                  type="number"
                  name="qc_apptlength"
                  id="qc_apptlength"
                  value={this.state.qc_apptlength}
                  onChange={this.handleChange}
                  placeholder="Length in Hours"
                />
              </td>
            </tr>
            <tr>
              <th>User ID</th>
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
              <th>Client ID</th>
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
              <th>Service ID</th>
              <td>
                <ServiceDropdown
                  id="qc_apptserviceid"
                  value={this.state.qc_apptserviceid}
                  onChange={this.handleChange}
                  services={this.props.services}
                />
              </td>
            </tr>
            <tr>
              <th>Appointment Notes</th>
              <td>
                <textarea
                  id="qc_apptnotes"
                  value={this.state.qc_apptnotes}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Search Appointments" />
      </form>
    );
  },
});

var AppointmentUpdateForm = React.createClass({
  getInitialState: function () {
    return {
      qc_upapptid: "",
      qc_upapptdate: "",
      qc_upappttime: "",
      qc_upapptlength: "",
      qc_upapptuserid: "",
      qc_upapptclientid: "",
      qc_upapptserviceid: "",
      qc_upapptnotes: "",
      updata: [],
      upusers: [],
      upclients: [],
      upservices: [],
    };
  },

  handleInputChange: function (event) {
    this.setState({
      [event.target.id]: event.target.value,
    });
  },

  handleUpdateSubmit: function (e) {
    e.preventDefault();
  
    var qc_upapptid = qc_upaptid.value;
    var qc_upapptdate = formatDateOnly(qc_upaptdate.value);
    var qc_upappttime = qc_upapttime.value;
    var qc_upapptlength = qc_upaptlength.value;
    var qc_upapptuserid = qc_upaptuserid.value;
    var qc_upapptclientid = qc_upaptclientid.value;
    var qc_upapptserviceid = qc_upaptserviceid.value;
    var qc_upapptnotes = qc_upaptnotes.value;
  
    this.props.onUpdateSubmit({
      qc_upaptid: qc_upapptid,
      qc_upaptdate: qc_upapptdate,
      qc_upapttime: qc_upappttime,
      qc_upaptlength: qc_upapptlength,
      qc_upaptuserid: qc_upapptuserid,
      qc_upaptclientid: qc_upapptclientid,
      qc_upaptserviceid: qc_upapptserviceid,
      qc_upaptnotes: qc_upapptnotes,
    });
  },
  
  

  render: function () {
    return (
      <form onSubmit={this.handleUpdateSubmit}>
        <table>
          <tbody>
            <tr>
              <th>Appointment Date</th>
              <td>
                <input
                  type="date"
                  name="qc_upaptdate"
                  id="qc_upaptdate"
                  value={this.state.qc_upaptdate}
                  onChange={this.handleInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>Appointment Time</th>
              <td>
                <input
                  type="time"
                  name="qc_upapttime"
                  id="qc_upapttime"
                  value={this.state.qc_upapttime}
                  onChange={this.handleInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>Appointment Length</th>
              <td>
                <input
                  type="number"
                  step="0.25"
                  name="qc_upaptlength"
                  id="qc_upaptlength"
                  value={this.state.qc_upaptlength}
                  onChange={this.handleInputChange}
                  placeholder="Length in Hours"
                />
              </td>
            </tr>
            <tr>
              <th>User ID</th>
              <td>
                <UserUpdateDropdown
                  id="qc_upaptuserid"
                  value={this.state.qc_upaptuserid}
                  onChange={this.handleInputChange}
                  upusers={this.props.upusers}
                />
              </td>
            </tr>
            <tr>
              <th>Client ID</th>
              <td>
                <ClientUpdateDropdown
                  id="qc_upaptclientid"
                  value={this.state.qc_upaptclientid}
                  onChange={this.handleInputChange}
                  upclients={this.props.upclients}
                />
              </td>
            </tr>
            <tr>
              <th>Service ID</th>
              <td>
                <ServiceUpdateDropdown
                  id="qc_upaptserviceid"
                  value={this.state.qc_upaptserviceid}
                  onChange={this.handleInputChange}
                  upservices={this.props.upservices}
                />
              </td>
            </tr>
            <tr>
              <th>Appointment Notes</th>
              <td>
                <textarea
                  id="qc_upaptnotes"
                  value={this.state.qc_upaptnotes}
                  onChange={this.handleInputChange}
                  placeholder="Edit notes..."
                />
              </td>
            </tr>
          </tbody>
        </table>
        <br />
        <input
          type="hidden"
          name="qc_upaptid"
          id="qc_upaptid"
          value={this.state.qc_upaptid}
          onChange={this.handleInputChange}
        />
        <input type="submit" value="Update Appointment" />
      </form>
    );
  },
});

var AppointmentList = React.createClass({
  render: function () {
    var appointmentNodes = this.props.data.map(function (appointment) {
      return (
        <Appointment
          key={appointment.qc_apptid}
          qc_apptid={appointment.qc_apptid}
          qc_apptdate={appointment.qc_apptdate}
          qc_appttime={appointment.qc_appttime}
          qc_apptlength={appointment.qc_apptlength}
          qc_apptuserid={appointment.qc_apptuserid}
          qc_apptclientid={appointment.qc_apptclientid}
          qc_apptserviceid={appointment.qc_apptserviceid}
        />
      );
    });
    return <tbody>{appointmentNodes}</tbody>;
  },
});

var Appointment = React.createClass({
  getInitialState: function () {
    return {
      qc_upapptid: "",
      singledata: [],
    };
  },

  updateRecord: function (e) {
    e.preventDefault();
    var qc_theupapptid = this.props.qc_apptid;
    this.loadSingleAppt(qc_theupapptid);
  },

  loadSingleAppt: function (qc_theupapptid) {
    $.ajax({
      url: "/getsingleappt",
      data: {
        qc_upapptid: qc_theupapptid,
      },
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ singledata: data });
        console.log(this.state.singledata);

        var populateAppt = this.state.singledata.map(function (appointment) {
          // Populate the fields with the data fetched for the selected appointment
          qc_upaptid.value = qc_theupapptid;
          qc_upaptdate.value = formatDateOnly(appointment.qc_apptdate),
          qc_upapttime.value = appointment.qc_appttime,
          qc_upaptlength.value = appointment.qc_apptlength;
          qc_upaptuserid.value = appointment.qc_apptuserid;
          qc_upaptclientid.value = appointment.qc_apptclientid;
          qc_upaptserviceid.value = appointment.qc_apptserviceid;
          qc_upaptnotes.value = appointment.qc_apptnotes;
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
        <td>{this.props.qc_apptid}</td>
        <td>{formatDateOnly(this.props.qc_apptdate)}</td>
        <td>{this.props.qc_appttime}</td>
        <td>{this.props.qc_apptlength}</td>
        <td>{this.props.qc_apptuserid}</td>
        <td>{this.props.qc_apptclientid}</td>
        <td>{this.props.qc_apptserviceid}</td>
        <td>
          <form onSubmit={this.updateRecord}>
            <input type="submit" value="Update Record" />
          </form>
        </td>
      </tr>
    );
  },
});

var UserDropdown = React.createClass({
  render: function () {
    var userOptions = this.props.users.map(function (user) {
      return (
        <option id={user.qc_userid} value={user.qc_userid}>
          {user.qc_username} {/* Adjust display as needed */}
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
        {userOptions}
      </select>
    );
  },
});

var ClientDropdown = React.createClass({
  render: function () {
    var clientOptions = this.props.clients.map(function (client) {
      return (
        <option id={client.qc_clientid} value={client.qc_clientid}>
          {client.qc_clientfirstname} {/* Adjust display as needed */}
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
        {clientOptions}
      </select>
    );
  },
});

var ServiceDropdown = React.createClass({
  render: function () {
    var serviceOptions = this.props.services.map(function (service) {
      return (
        <option id={service.qc_serviceid} value={service.qc_serviceid}>
          {service.qc_servicename} {/* Adjust display as needed */}
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
        {serviceOptions}
      </select>
    );
  },
});

var UserUpdateDropdown = React.createClass({
  render: function () {
    var userOptions = this.props.upusers.map(function (user) {
      return (
        <option id={user.qc_userid} value={user.qc_userid}>
          {user.qc_username} {/* Adjust display as needed */}
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
        {userOptions}
      </select>
    );
  },
});

var ClientUpdateDropdown = React.createClass({
  render: function () {
    var clientOptions = this.props.upclients.map(function (client) {
      return (
        <option id={client.qc_clientid} value={client.qc_clientid}>
          {client.qc_clientfirstname} {/* Adjust display as needed */}
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
        {clientOptions}
      </select>
    );
  },
});

var ServiceUpdateDropdown = React.createClass({
  render: function () {
    var serviceOptions = this.props.upservices.map(function (service) {
      return (
        <option id={service.qc_serviceid} value={service.qc_serviceid}>
          {service.qc_servicename} {/* Adjust display as needed */}
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
        {serviceOptions}
      </select>
    );
  },
});

ReactDOM.render(<AppointmentBox />, document.getElementById("content"));
