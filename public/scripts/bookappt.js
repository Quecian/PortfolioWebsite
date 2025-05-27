$(document).ready(function () {
  $.get("/cligetloggedin/", function (data) {
    if (parseInt(data) === 0) {
      window.location.href = "clientlogin.html"; // or your actual login path
    }
  });
});

var BookingBox = React.createClass({
  getInitialState: function () {
    return {
      qc_clientfirstname: "",
      qc_clientid: "",
      users: [],
    };
  },

  componentDidMount: function () {
    // Get client info
    $.ajax({
      url: "/getclientinfo",
      dataType: "json",
      type: "GET",
      success: function (data) {
        this.setState({
          qc_clientfirstname: data.firstname,
          qc_clientid: data.qc_clientid,
        });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("Error fetching client info:", err.toString());
        alert("Error fetching client info. Please log in.");
      }.bind(this),
    });
  },

  handleBookingSubmit: function (booking) {
    console.log("Data Sent to Server:", booking);

    $.ajax({
      url: "/bookappt",
      dataType: "json",
      contentType: "application/json",
      type: "POST",
      data: JSON.stringify(booking),
      success: function (data) {
        this.setState({ data: data });
        alert("Booking created successfully!");
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(
          "Error submitting booking:",
          xhr.responseText || err.toString()
        );
        alert("Failed to create booking. Please check your inputs.");
      }.bind(this),
    });
  },

  render: function () {
    return (
      <div className="BookingBox">
        <h1>Visit The Grotto Today</h1>
        <BookingForm
          onBookingSubmit={this.handleBookingSubmit}
          qc_clientfirstname={this.state.qc_clientfirstname}
          qc_clientid={this.state.qc_clientid}
        />
      </div>
    );
  },
});

var BookingForm = React.createClass({
  getInitialState: function () {
    return {
      selectedServices: [],
      qc_userid: "",
      qc_date: "",
      qc_time: "",
      qc_notes: "",
      showPopup: false,
      services: [],
      users: [],
    };
  },

  componentDidMount: function () {
    // Fetch available stylists
    $.ajax({
      url: "/getusertypes",
      dataType: "json",
      type: "GET",
      success: function (data) {
        this.setState({ users: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getusertypes", status, err.toString());
      }.bind(this),
    });
  },

  handleSubmit: function (e) {
    e.preventDefault();

    const { selectedServices, qc_userid, qc_date, qc_time, qc_notes } = this.state;

    if (!selectedServices.length || !qc_userid || !qc_date || !qc_time) {
      alert("Please fill out all required fields.");
      return;
    }

    const bookingData = {
      qc_clientid: this.props.qc_clientid,
      selectedServices,
      qc_date,
      qc_time,
      qc_notes: qc_notes || "",
      qc_userid,
    };

    console.log("Booking Data Sent:", bookingData);
    this.props.onBookingSubmit(bookingData);
  },

  setValue: function (field, event) {
    this.setState({ [field]: event.target.value });
  },

  togglePopup: function () {
    if (!this.state.showPopup) {
      $.ajax({
        url: "/getservices",
        dataType: "json",
        type: "GET",
        success: function (data) {
          this.setState({ services: data, showPopup: true });
        }.bind(this),
        error: function (xhr, status, err) {
          console.error("/getservices", status, err.toString());
        }.bind(this),
      });
    } else {
      this.setState({ showPopup: false });
    }
  },

  selectService: function (qc_servicename) {
    const selectedServices = [...this.state.selectedServices];
    const index = selectedServices.indexOf(qc_servicename);

    if (index > -1) {
      selectedServices.splice(index, 1);
    } else {
      selectedServices.push(qc_servicename);
    }

    this.setState({ selectedServices });
  },

  render: function () {
    return (
      <form className="bookingForm" onSubmit={this.handleSubmit}>
        <h2>
          Hi {this.props.qc_clientfirstname || "there"}! How may we assist you
          today?
        </h2>

        <div className="input-group-book">
          <select
            onChange={this.setValue.bind(this, "qc_userid")}
            value={this.state.qc_userid}
          >
            <option value="">Select a Stylist</option>
            {this.state.users.map((user) => (
              <option key={user.qc_userid} value={user.qc_userid}>
                {user.qc_userfirstname}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Select Services"
            value={this.state.selectedServices.join(", ")}
            readOnly
            onClick={this.togglePopup}
          />
        </div>

        <div className="input-group-book">
          <input
            type="date"
            onChange={this.setValue.bind(this, "qc_date")}
            value={this.state.qc_date}
          />
          <input
            type="time"
            step="900"
            onChange={this.setValue.bind(this, "qc_time")}
            value={this.state.qc_time}
          />
        </div>

        <textarea
          placeholder="Appointment Notes"
          onChange={this.setValue.bind(this, "qc_notes")}
          value={this.state.qc_notes}
        />

        <div className="button-container-book">
          <button className="button-book" type="submit">
            Confirm
          </button>
        </div>

        {this.state.showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Select Services</h3>
              <ul>
                {this.state.services.map((service, index) => (
                  <li
                    key={index}
                    onClick={() => this.selectService(service.qc_servicename)}
                    className={
                      this.state.selectedServices.includes(service.qc_servicename)
                        ? "selected"
                        : ""
                    }
                  >
                    {service.qc_servicename} - ${service.qc_servicecost}
                  </li>
                ))}
              </ul>
              <button className="close-popup" onClick={this.togglePopup}>
                Close
              </button>
            </div>
          </div>
        )}
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

    return <td>{this.props.errorMessage}</td>;
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

ReactDOM.render(<BookingBox />, document.getElementById("content"));
