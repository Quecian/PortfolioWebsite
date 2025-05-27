"use strict";

var usruser = 0;

function formatDateOnly(datetimeString) {
  return new Date(datetimeString).toISOString().split("T")[0];
}

var BookingBox = React.createClass({
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
          this.loadBookingsFromServer();
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  loadBookingsFromServer: function () {
    $.ajax({
      url: "/getbookings",
      data: {
        qc_bookingid: qc_bookingid.value,
        qc_clientid: qc_clientid.value,
        qc_userid: qc_userid.value,
        qc_appointmentdate: qc_appointmentdate.value,
        qc_appointmenttime: qc_appointmenttime.value,
        qc_servicename: qc_servicename.value,
        qc_servicetype: qc_servicetype.value,
        qc_saletotal: qc_saletotal.value,
        qc_notes: qc_notes.value,
      },
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getbookings", status, err.toString());
      }.bind(this),
    });
  },

  componentDidMount: function () {
    this.loadAllowLogin();
    this.loadBookingsFromServer();
  },

  render: function () {
    if (this.state.viewthepage == 0) {
      return <div>You do not have access to this page.</div>;
    } else {
      return (
        <div>
          <h1>Search Bookings</h1>
          <BookingForm onBookingSubmit={this.loadBookingsFromServer} />
          <br />
          <div id="theresults">
            <div id="theleft">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Client ID</th>
                    <th>User ID</th>
                    <th>Appointment Date</th>
                    <th>Appointment Time</th>
                    <th>Service Name</th>
                    <th>Service Type</th>
                    <th>Sale Total</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <BookingList data={this.state.data} />
              </table>
            </div>
          </div>
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
      qc_servicename: "",
      qc_servicetype: "",
      qc_saletotal: "",
      qc_notes: "",
      clients: [],
      users: [],
      services: [],
    };
  },

  componentDidMount: function () {
    $.ajax({
      url: "/getclienttypes",
      dataType: "json",
      success: (data) => this.setState({ clients: data }),
    });
    $.ajax({
      url: "/getusertypes",
      dataType: "json",
      success: (data) => this.setState({ users: data }),
    });
    $.ajax({
      url: "/getservicetypes",
      dataType: "json",
      success: (data) => this.setState({ services: data }),
    });
  },

  handleSubmit: function (e) {
    e.preventDefault();
    this.props.onBookingSubmit({
      qc_bookingid: this.state.qc_bookingid.trim(),
      qc_clientid: this.state.qc_clientid.trim(),
      qc_userid: this.state.qc_userid.trim(),
      qc_appointmentdate: this.state.qc_appointmentdate.trim(),
      qc_appointmenttime: this.state.qc_appointmenttime.trim(),
      qc_servicename: this.state.qc_servicename.trim(),
      qc_servicetype: this.state.qc_servicetype.trim(),
      qc_saletotal: this.state.qc_saletotal.trim(),
      qc_notes: this.state.qc_notes.trim(),
    });
  },

  handleChange: function (event) {
    this.setState({ [event.target.id]: event.target.value });
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
                  <input
                    type="text"
                    id="qc_servicename"
                    value={this.state.qc_servicename}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Service Type</th>
                <td>
                  <select
                    name="qc_servicetype"
                    id="qc_servicetype"
                    value={this.state.qc_servicetype}
                    onChange={this.handleChange}
                  >
                    <option value="">Filter Services</option>
                    <option value="General">General</option>
                    <option value="Hair">Hair</option>
                    <option value="Nail">Nail</option>
                    <option value="Face">Face</option>
                  </select>
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
          <input type="submit" value="Search Booking" />
        </form>
      </div>
    );
  },
});

var BookingList = React.createClass({
  render: function () {
    var bookingNodes = this.props.data.map(function (booking) {
      return (
        <Booking
          key={booking.qc_bookingid}
          qc_bookingid={booking.qc_bookingid}
          qc_clientid={booking.qc_clientid}
          qc_userid={booking.qc_userid}
          qc_appointmentdate={booking.qc_appointmentdate}
          qc_appointmenttime={booking.qc_appointmenttime}
          qc_servicename={booking.qc_servicename}
          qc_servicetype={booking.qc_servicetype}
          qc_saletotal={booking.qc_saletotal}
          qc_notes={booking.qc_notes}
        />
      );
    });
    return <tbody>{bookingNodes}</tbody>;
  },
});

var Booking = React.createClass({
  render: function () {
    return (
      <tr>
        <td>{this.props.qc_bookingid}</td>
        <td>{this.props.qc_clientid}</td>
        <td>{this.props.qc_userid}</td>
        <td>{formatDateOnly(this.props.qc_appointmentdate)}</td>
        <td>{this.props.qc_appointmenttime}</td>
        <td>{this.props.qc_servicename}</td>
        <td>{this.props.qc_servicetype}</td>
        <td>{this.props.qc_saletotal}</td>
        <td>{this.props.qc_notes}</td>
      </tr>
    );
  },
});

ReactDOM.render(<BookingBox />, document.getElementById("content"));
