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
}
var usruser = 0;

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
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  updateSingleBookingFromServer: function (booking) {
    $.ajax({
      url: "/updatebooking",
      dataType: "json",
      data: booking,
      type: "POST",
      cache: false,
      success: function (updateData) {
        this.setState({ updateData: updateData });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
    window.location.reload(true);
  },

  componentDidMount: function () {
    this.loadAllowLogin();
    this.loadBookingsFromServer();
  },

  render: function () {
    if (this.state.viewthepage == 3) {
      return <div>You do not have access to this page.</div>;
    } else {
      return (
        <div>
          <h1>Update Bookings</h1>
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
                    <th></th>
                  </tr>
                </thead>
                <BookingList data={this.state.data} />
              </table>
            </div>
            <div id="theright">
              <BookingUpdateForm
                onUpdateSubmit={this.updateSingleBookingFromServer}
              />
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

    var qc_bookingid = this.state.qc_bookingid.trim();
    var qc_clientid = this.state.qc_clientid.trim();
    var qc_userid = this.state.qc_userid.trim();
    var qc_appointmentdate = this.state.qc_appointmentdate.trim();
    var qc_appointmenttime = this.state.qc_appointmenttime.trim();
    var qc_servicename = this.state.qc_servicename.trim();
    var qc_servicetype = this.state.qc_servicetype.trim();
    var qc_saletotal = this.state.qc_saletotal.trim();
    var qc_notes = this.state.qc_notes.trim();

    this.props.onBookingSubmit({
      qc_bookingid: qc_bookingid,
      qc_clientid: qc_clientid,
      qc_userid: qc_userid,
      qc_appointmentdate: qc_appointmentdate,
      qc_appointmenttime: qc_appointmenttime,
      qc_servicename: qc_servicename,
      qc_servicetype: qc_servicetype,
      qc_saletotal: qc_saletotal,
      qc_notes: qc_notes,
    });
  },

  handleChange: function (event) {
    this.setState({
      [event.target.id]: event.target.value,
    });
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
                    name="qc_appointmentdate"
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
                    name="qc_appointmenttime"
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
                    name="qc_servicename"
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
                    name="qc_saletotal"
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
                    name="qc_notes"
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

var BookingUpdateForm = React.createClass({
  getInitialState: function () {
    return {
      qc_upbookingid: "",
      qc_UPclientid: "",
      qc_upuserid: "",
      qc_upappointmentdate: "",
      qc_upappointmenttime: "",
      qc_upservicename: "",
      qc_upservicetype: "",
      qc_upsaletotal: "",
      qc_upnotes: "",
      upclients: [],
      upusers: [],
    };
  },

  componentDidMount: function () {
    // Fetch client types
    $.ajax({
      url: "/getclienttypes",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ upclients: data });
      }.bind(this),
    });

    // Fetch user types
    $.ajax({
      url: "/getusertypes",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ upusers: data });
      }.bind(this),
    });
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var qc_upbookingid = qc_upbookid.value;
    var qc_UPclientid = qc_upcliid.value;
    var qc_upuserid = qc_upusrid.value;
    var qc_upappointmentdate = formatDateOnly(qc_upapptdate.value);
    var qc_upappointmenttime = qc_upappttime.value;
    var qc_upservicename = qc_upservname.value;
    var qc_upservicetype = qc_upservtype.value;
    var qc_upsaletotal = qc_upsletotal.value;
    var qc_upnotes = qc_upntes.value;

    this.props.onUpdateSubmit({
      qc_upbookid: qc_upbookingid,
      qc_upcliid: qc_UPclientid,
      qc_upusrid: qc_upuserid,
      qc_upapptdate: qc_upappointmentdate,
      qc_upappttime: qc_upappointmenttime,
      qc_upservname: qc_upservicename,
      qc_upservtype: qc_upservicetype,
      qc_upsletotal: qc_upsaletotal,
      qc_upntes: qc_upnotes,
    });
  },

  handleChange: function (event) {
    this.setState({
      [event.target.id]: event.target.value,
    });
  },

  render: function () {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <h2>Update Booking</h2>
          <table>
            <tbody>
              <tr>
                <th>Client ID</th>
                <td>
                  <select
                    id="qc_upcliid"
                    value={this.state.qc_upcliid}
                    onChange={this.handleChange}
                  >
                    <option value="">Select a client</option>
                    {this.state.upclients.map((client) => (
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
                    id="qc_upusrid"
                    value={this.state.qc_upusrid}
                    onChange={this.handleChange}
                  >
                    <option value="">Select a user</option>
                    {this.state.upusers.map((user) => (
                      <option key={user.qc_userid} value={user.qc_userid}>
                        {user.qc_username}
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
                    name="qc_upapptdate"
                    id="qc_upapptdate"
                    value={this.state.qc_upapptdate}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Appointment Time</th>
                <td>
                  <input
                    type="time"
                    name="qc_upappttime"
                    id="qc_upappttime"
                    value={this.state.qc_upappttime}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Service Name</th>
                <td>
                  <input
                    type="text"
                    name="qc_upservname"
                    id="qc_upservname"
                    value={this.state.qc_upservname}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Service Type</th>
                <td>
                  <select
                    name="qc_upservtype"
                    id="qc_upservtype"
                    value={this.state.qc_servtype}
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
                    name="qc_upsletotal"
                    id="qc_upsletotal"
                    value={this.state.qc_upsletotal}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Notes</th>
                <td>
                  <textarea
                    name="qc_upntes"
                    id="qc_upntes"
                    value={this.state.qc_upntes}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <input type="hidden" name="qc_upbookid" id="qc_upbookid" />
          <input type="submit" value="Update" />
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
          qc_appointmentdate={formatDateOnly(booking.qc_appointmentdate)}
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
  getInitialState: function () {
    return {
      qc_upbookingkey: "",
      singledata: [],
    };
  },

  updateRecord: function (e) {
    e.preventDefault();
    var qc_theupbookingkey = this.props.qc_bookingid;
    this.loadSingleBooking(qc_theupbookingkey);
  },

  loadSingleBooking: function (qc_theupbookingkey) {
    $.ajax({
      url: "/getsinglebooking",
      data: { qc_upbookingid: qc_theupbookingkey },
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ singledata: data });
        console.log(this.state.singledata);

        var populateBooking = this.state.singledata.map(function (booking) {
          qc_upbookid.value = qc_theupbookingkey;
          qc_upcliid.value = booking.qc_clientid;
          qc_upusrid.value = booking.qc_userid;
          qc_upapptdate.value = formatDateOnly(booking.qc_appointmentdate);
          qc_upappttime.value = booking.qc_appointmenttime;
          qc_upservname.value = booking.qc_servicename;
          qc_upservtype.value = booking.qc_servicetype;
          qc_upsletotal.value = booking.qc_saletotal;
          qc_upntes.value = booking.qc_notes;
        });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getsinglebooking", status, err.toString());
      }.bind(this),
    });
  },

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
        <td>
          <form onSubmit={this.updateRecord}>
            <input type="submit" value="Update Record" />
          </form>
        </td>
      </tr>
    );
  },
});

ReactDOM.render(<BookingBox />, document.getElementById("content"));
