"use strict";
$(document).ready(function () {
  $.get("/usrgetloggedin/", function (data) {
    if (parseInt(data) === 0) {
      window.location.href = "/backend/login.html";
    }
  });
});
var usruser = 0;

var AppointmentBox = React.createClass({
  getInitialState: function () {
    return { viewthepage: 0 };
  },

  handleAppointmentSubmit: function (appointment) {
    // Send the appointment data to the backend
    $.ajax({
      url: "/appointment", // Ensure this matches your backend endpoint for appointments
      dataType: "json",
      type: "POST",
      data: appointment,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
    window.location.reload(true);
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
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  componentDidMount: function () {
    this.loadAllowLogin();
  },

  render: function () {
    if (this.state.viewthepage == 0) {
      return <div>You do not have access to this page.</div>;
    } else {
      return (
        <div className="AppointmentBox">
          <h1>Appointments</h1>
          <AppointmentForm onAppointmentSubmit={this.handleAppointmentSubmit} />
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
      users: [],
      clients: [],
      services: [],
    };
  },

  handleChange: function (event) {
    this.setState({
      [event.target.name]: event.target.value, // Dynamically update state based on the field name
    });
  },

  componentDidMount: function () {
    // Fetch users
    $.ajax({
      url: "/getusertypes",
      dataType: "json",
      success: function (data) {
        this.setState({ users: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getusertypes", status, err.toString());
      }.bind(this),
    });

    // Fetch clients
    $.ajax({
      url: "/getclienttypes",
      dataType: "json",
      success: function (data) {
        this.setState({ clients: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getclienttypes", status, err.toString());
      }.bind(this),
    });

    // Fetch services
    $.ajax({
      url: "/getservices",
      dataType: "json",
      success: function (data) {
        this.setState({ services: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getservices", status, err.toString());
      }.bind(this),
    });
  },

  handleSubmit: function (e) {
    e.preventDefault();

    // Extract and validate input
    var qc_apptdate = this.state.qc_apptdate.trim();
    var qc_appttime = this.state.qc_appttime.trim();
    var qc_apptlength = parseFloat(this.state.qc_apptlength);
    var qc_apptuserid = this.state.qc_apptuserid || null; // Nullable
    var qc_apptclientid = this.state.qc_apptclientid || null; // Nullable
    var qc_apptserviceid = this.state.qc_apptserviceid || null; // Nullable

    // Ensure required fields are filled
    if (!qc_apptdate || !qc_appttime || isNaN(qc_apptlength)) {
      console.log("Appointment Date, Time, and Length are required.");
      return;
    }

    var appointmentData = {
      qc_apptdate: qc_apptdate,
      qc_appttime: qc_appttime,
      qc_apptlength: qc_apptlength,
      qc_apptuserid: qc_apptuserid,
      qc_apptclientid: qc_apptclientid,
      qc_apptserviceid: qc_apptserviceid,
    };

    // Pass data to the parent component for submission
    this.props.onAppointmentSubmit(appointmentData);

    // Reset form fields
    this.setState({
      qc_apptdate: "",
      qc_appttime: "",
      qc_apptlength: "",
      qc_apptuserid: "",
      qc_apptclientid: "",
      qc_apptserviceid: "",
    });
  },

  render: function () {
    return (
      <form className="AppointmentForm" onSubmit={this.handleSubmit}>
        <h2>Appointment Details</h2>
        <table>
          <tbody>
            <tr>
              <th>Appointment Date</th>
              <td>
                <input
                  type="date"
                  name="qc_apptdate"
                  value={this.state.qc_apptdate}
                  onChange={this.handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th>Appointment Time</th>
              <td>
                <input
                  type="time"
                  name="qc_appttime"
                  step="900"
                  value={this.state.qc_appttime}
                  onChange={this.handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th>Appointment Length</th>
              <td>
                <input
                  type="number"
                  step="0.25" // Decimal precision
                  name="qc_apptlength"
                  value={this.state.qc_apptlength}
                  onChange={this.handleChange}
                  required
                  placeholder="Length in Hours"
                />
              </td>
            </tr>
            <tr>
              <th>User</th>
              <td>
                <select
                  name="qc_apptuserid"
                  value={this.state.qc_apptuserid}
                  onChange={this.handleChange}
                >
                  <option value="">Select a User</option>
                  {this.state.users.map(function (user) {
                    return (
                      <option key={user.qc_userid} value={user.qc_userid}>
                        {user.qc_userfirstname}
                      </option>
                    );
                  })}
                </select>
              </td>
            </tr>
            <tr>
              <th>Client</th>
              <td>
                <select
                  name="qc_apptclientid"
                  value={this.state.qc_apptclientid}
                  onChange={this.handleChange}
                >
                  <option value="">Select a Client</option>
                  {this.state.clients.map(function (client) {
                    return (
                      <option
                        key={client.qc_clientid}
                        value={client.qc_clientid}
                      >
                        {client.qc_clientfirstname}
                      </option>
                    );
                  })}
                </select>
              </td>
            </tr>
            <tr>
              <th>Service</th>
              <td>
                <select
                  name="qc_apptserviceid"
                  value={this.state.qc_apptserviceid}
                  onChange={this.handleChange}
                >
                  <option value="">Select a Service</option>
                  {this.state.services.map(function (service) {
                    return (
                      <option
                        key={service.qc_serviceid}
                        value={service.qc_serviceid}
                      >
                        {service.qc_servicename}
                      </option>
                    );
                  })}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Add Appointment" />
      </form>
    );
  },
});

var InputError = React.createClass({
  getInitialState: function () {
    return {
      message: "Input is invalid",
    };
  },
  render: function () {
    var errorClass = classNames(this.props.className, {
      error_container: true,
      visible: this.props.visible,
      invisible: !this.props.visible,
    });

    return <td> {this.props.errorMessage} </td>;
  },
});

var TextInput = React.createClass({
  getInitialState: function () {
    return {
      isuserty: true,
      value: null,
      valid: false,
      errorMessage: "",
      errorVisible: false,
    };
  },

  handleChange: function (event) {
    this.validation(event.target.value);

    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },

  validation: function (value, valid) {
    if (typeof valid === "undefined") {
      valid = true;
    }

    var message = "";
    var errorVisible = false;

    if (!valid) {
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    } else if (this.props.required && jQuery.isusertyObject(value)) {
      message = this.props.usertyMessage;
      valid = false;
      errorVisible = true;
    } else if (value.length < this.props.minCharacters) {
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    }

    this.setState({
      value: value,
      isuserty: jQuery.isusertyObject(value),
      valid: valid,
      errorMessage: message,
      errorVisible: errorVisible,
    });
  },

  handleBlur: function (event) {
    var valid = this.props.validate(event.target.value);
    this.validation(event.target.value, valid);
  },
  render: function () {
    if (this.props.textArea) {
      return (
        <div className={this.props.uniqueName}>
          <textarea
            placeholder={this.props.text}
            className={"input input-" + this.props.uniqueName}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            value={this.props.value}
          />

          <InputError
            visible={this.state.errorVisible}
            errorMessage={this.state.errorMessage}
          />
        </div>
      );
    } else {
      return (
        <div className={this.props.uniqueName}>
          <input
            type={this.props.inputType}
            name={this.props.uniqueName}
            id={this.props.uniqueName}
            placeholder={this.props.text}
            className={"input input-" + this.props.uniqueName}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            value={this.props.value}
          />

          <InputError
            visible={this.state.errorVisible}
            errorMessage={this.state.errorMessage}
          />
        </div>
      );
    }
  },
});

ReactDOM.render(<AppointmentBox />, document.getElementById("content"));
