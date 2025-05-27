"use strict";

var usruser = 0;

var ServiceBox = React.createClass({
    getInitialState: function () {
        return { viewthepage: 0 };
      },
  handleServiceSubmit: function (service) {
    $.ajax({
      url: "/service",
      dataType: "json",
      type: "POST",
      data: service,
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
        this.setState({ viewthepage: data });
        usruser = this.state.viewthepage;
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
    if (this.state.viewthepage == 3) {
      return <div>You do not have access to this page.</div>;
    } else {
      return (
        <div className="ServiceBox">
          <h1>Services</h1>
          <ServiceForm onServiceSubmit={this.handleServiceSubmit} />
        </div>
      );
    }
  },
});

var ServiceForm = React.createClass({
  getInitialState: function () {
    return {
      qc_servicename: "",
      qc_servicelength: 0,
      qc_servicetype: "Hair",
      qc_servicenote: "",
      qc_servicecost: 0, // Initialize as 0
    };
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var qc_servicename = this.state.qc_servicename.trim();
    var qc_servicelength = this.state.qc_servicelength;
    var qc_servicetype = this.state.qc_servicetype;
    var qc_servicenote = this.state.qc_servicenote.trim();
    var qc_servicecost = this.state.qc_servicecost; // No trim, it's a number

    if (
      !qc_servicename ||
      qc_servicelength === "" ||
      !qc_servicetype ||
      qc_servicecost === ""
    ) {
      console.log("Field Missing");
      return;
    }

    var serviceData = {
      qc_servicename: qc_servicename,
      qc_servicelength: qc_servicelength,
      qc_servicetype: qc_servicetype,
      qc_servicenote: qc_servicenote,
      qc_servicecost: qc_servicecost,
    };

    this.props.onServiceSubmit(serviceData);
  },

  commonValidate: function () {
    return true;
  },

  setValue: function (field, event) {
    var object = {};
    object[field] = event.target.value;
    this.setState(object);
  },

  render: function () {
    return (
      <form className="serviceForm" onSubmit={this.handleSubmit}>
        <h2>Service Details</h2>
        <table>
          <tbody>
            <tr>
              <th>Service Name</th>
              <td>
                <TextInput
                  value={this.state.qc_servicename}
                  uniqueName="qc_servicename"
                  required={true}
                  minCharacters={1}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_servicename")}
                  errorMessage="Service Name is required"
                  emptyMessage="Service Name is required"
                />
              </td>
            </tr>
            <tr>
              <th>Service Length</th>
              <td>
                <input
                  type="number"
                  step="0.25"
                  value={this.state.qc_servicelength}
                  onChange={this.setValue.bind(this, "qc_servicelength")}
                  required={true}
                />
              </td>
            </tr>
            <tr>
              <th>Service Type</th>
              <td>
                <select
                  value={this.state.qc_servicetype}
                  onChange={this.setValue.bind(this, "qc_servicetype")}
                >
                  <option value="Hair">Hair</option>
                  <option value="Nails">Nails</option>
                  <option value="Facials">Facials</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>Service Notes</th>
              <td>
                <TextInput
                  value={this.state.qc_servicenote}
                  uniqueName="qc_servicenote"
                  textArea={true}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_servicenote")}
                  errorMessage="Service Notes is invalid"
                  emptyMessage="Service Notes is required"
                />
              </td>
            </tr>
            <tr>
              <th>Service Cost</th>
              <td>
                <input
                  type="number"
                  step="0.01" // .01 Intervals
                  value={this.state.qc_servicecost}
                  onChange={this.setValue.bind(this, "qc_servicecost")}
                  required={true}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Insert Service" />
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

ReactDOM.render(<ServiceBox />, document.getElementById("content"));
