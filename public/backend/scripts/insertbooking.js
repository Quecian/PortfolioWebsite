"use strict";

var usruser = 0;

var BookingBox = React.createClass({
  getInitialState: function () {
    return { viewthepage: 0 };
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
        <div>
          <h1>Insert Booking</h1>
          <BookingForm onBookingSubmit={this.handleBookingSubmit} />
        </div>
      );
    }
  },
});

var BookingForm = React.createClass({
  getInitialState: function () {
    return {
      qc_bookingid: "",
      qc_clientid: "",
      qc_userid: "",
      qc_appointmentdate: "",
      qc_appointmenttime: "",
      qc_serviceid: "",
      qc_servicename: "",
      qc_servicetype: "",
      qc_saletotal: "",
      qc_notes: "",
      clients: [],
      users: [],
      services: [],
      data: [],
    };
  },

  componentDidMount: function () {
    // Fetch clients
    $.ajax({
      url: "/getclienttypes",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ clients: data });
      }.bind(this),
    });

    // Fetch users
    $.ajax({
      url: "/getusertypes",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ users: data });
      }.bind(this),
    });

    $.ajax({
      url: "/getservicetypes",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ services: data });
      }.bind(this),
    });
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var role = {
      qc_bookingid: this.state.qc_bookingid.trim(),
      qc_clientid: this.state.qc_clientid.trim(),
      qc_userid: this.state.qc_userid.trim(),
      qc_appointmentdate: this.state.qc_appointmentdate.trim(),
      qc_appointmenttime: this.state.qc_appointmenttime.trim(),
      qc_serviceid: this.state.qc_serviceid.trim(),
      qc_servicename: this.state.qc_servicename.trim(),
      qc_servicetype: this.state.qc_servicetype.trim(),
      qc_saletotal: this.state.qc_saletotal.trim(),
      qc_notes: this.state.qc_notes.trim(),
    };

    console.log("Submitting booking:", role); // 👈 Add this log
    this.props.onBookingSubmit(role);
  },

  handleChange: function (event) {
    const { id, value } = event.target;

    if (id === "qc_serviceid") {
      const selectedService = this.state.services.find(
        (service) => service.qc_serviceid.toString() === value
      );

      this.setState({
        qc_serviceid: value,
        qc_servicename: selectedService ? selectedService.qc_servicename : "",
        qc_servicetype: selectedService ? selectedService.qc_servicetype : "",
      });
    } else {
      this.setState({ [id]: value });
    }
  },

  render: function () {
    return (
      <div>
        <form className="theform" onSubmit={this.handleSubmit}>
          <h2>Search Booking</h2>
          <table>
            <tbody>
              <tr>
                <th>Client ID</th>
                <td>
                  <select
                    id="qc_clientid"
                    value={this.state.qc_clientid}
                    onChange={this.handleChange}
                  >
                    <option value="">Select a client</option>
                    {this.state.clients.map((client) => (
                      <option
                        key={client.qc_clientid}
                        value={client.qc_clientid}
                      >
                        {client.qc_clientfirstname}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <th>User ID</th>
                <td>
                  <select
                    id="qc_userid"
                    value={this.state.qc_userid}
                    onChange={this.handleChange}
                  >
                    <option value="">Select a user</option>
                    {this.state.users.map((user) => (
                      <option key={user.qc_userid} value={user.qc_userid}>
                        {user.qc_userfirstname}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <th>Appointment Date</th>
                <td>
                  <input
                    type="date"
                    id="qc_appointmentdate"
                    value={this.state.qc_appointmentdate}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Appointment Time</th>
                <td>
                  <input
                    type="time"
                    id="qc_appointmenttime"
                    value={this.state.qc_appointmenttime}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Service Name</th>
                <td>
                  <select
                    id="qc_serviceid"
                    value={this.state.qc_serviceid}
                    onChange={this.handleChange}
                  >
                    <option value="">Select a Service</option>
                    {this.state.services.map((service) => (
                      <option
                        key={service.qc_serviceid}
                        value={service.qc_serviceid}
                      >
                        {service.qc_servicename}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <th>Service Type</th>
                <td>
                  <input
                    type="text"
                    id="qc_servicetype"
                    value={this.state.qc_servicetype}
                    onChange={this.handleChange}
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <th>Sale Total</th>
                <td>
                  <input
                    type="text"
                    id="qc_saletotal"
                    value={this.state.qc_saletotal}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Notes</th>
                <td>
                  <textarea
                    id="qc_notes"
                    value={this.state.qc_notes}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <input type="hidden" id="qc_bookingid" />
          <input type="submit" value="Insert Booking" />
        </form>
      </div>
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
      isEmpty: true,
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
    } else if (this.props.required && jQuery.isEmptyObject(value)) {
      message = this.props.emptyMessage;
      valid = false;
      errorVisible = true;
    } else if (value.length < this.props.minCharacters) {
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    }

    this.setState({
      value: value,
      isEmpty: jQuery.isEmptyObject(value),
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

ReactDOM.render(<BookingBox />, document.getElementById("content"));
