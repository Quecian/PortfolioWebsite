var SignupBox = React.createClass({
  handleSignupSubmit: function (user) {
    $.ajax({
      url: "/client",
      dataType: "json",
      type: "POST",
      data: user,
      success: function (data) {
        this.setState({ data: data });
        if (typeof data.redirect === "string") {
          window.location = data.redirect;
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  render: function () {
    return (
      <div className="SignupBox">
        <h1>Create Your Account</h1>
        <SignupForm onSignupSubmit={this.handleSignupSubmit} />
      </div>
    );
  },
});

var SignupForm = React.createClass({
  getInitialState: function () {
    return {
      qc_clientfirstname: "",
      qc_clientlastname: "",
      qc_clientemail: "",
      qc_clientphone: "",
      qc_clientpassword: "",
      qc_password2: "",
      qc_clientaddress: "",
      qc_clientzip: "",
    };
  },

  handleSubmit: function (e) {
    e.preventDefault();
    const {
      qc_clientfirstname,
      qc_clientlastname,
      qc_clientemail,
      qc_clientphone,
      qc_clientpassword,
      qc_password2,
      qc_clientaddress,
      qc_clientzip,
    } = this.state;

    if (
      !qc_clientfirstname ||
      !qc_clientlastname ||
      !qc_clientemail ||
      !qc_clientphone ||
      !qc_clientpassword ||
      !qc_password2
    ) {
      console.log("Field Missing");
      return;
    }

    if (qc_clientpassword !== qc_password2) {
      console.log("Passwords do not match");
      return;
    }

    if (qc_clientpassword.length < 6) {
      console.log("Password must be at least 6 characters");
      return;
    }

    const signupData = {
      qc_clientfirstname: qc_clientfirstname.trim(),
      qc_clientlastname: qc_clientlastname.trim(),
      qc_clientemail: qc_clientemail.trim(),
      qc_clientphone: qc_clientphone.trim(),
      qc_clientpassword,
      qc_clientaddress: qc_clientaddress.trim(),
      qc_clientzip: qc_clientzip.trim(),
    };

    this.props.onSignupSubmit(signupData);
  },

  setValue: function (field, event) {
    this.setState({ [field]: event.target.value });
  },

  render: function () {
    return (
      <form className="signupForm" onSubmit={this.handleSubmit}>
        <h2>Sign Up</h2>
        <div className="input-group-book">
          <input
            type="text"
            placeholder="First Name"
            onChange={this.setValue.bind(this, "qc_clientfirstname")}
          />
          <input
            type="text"
            placeholder="Last Name"
            onChange={this.setValue.bind(this, "qc_clientlastname")}
          />
          <input
            type="email"
            placeholder="Email"
            onChange={this.setValue.bind(this, "qc_clientemail")}
          />
        </div>
        <div className="input-group-book">
          <input
            type="password"
            placeholder="Enter Password"
            onChange={this.setValue.bind(this, "qc_clientpassword")}
          />
          <input
            type="password"
            placeholder="Re-Enter Password"
            onChange={this.setValue.bind(this, "qc_password2")}
          />
        </div>
        <div className="input-group-book">
          <input
            type="tel"
            placeholder="Phone Number"
            onChange={this.setValue.bind(this, "qc_clientphone")}
          />
        </div>
        <div className="input-group-book">
          <input
            type="text"
            placeholder="Billing Address"
            onChange={this.setValue.bind(this, "qc_clientaddress")}
          />
          <input
            type="text"
            placeholder="Billing Zip"
            onChange={this.setValue.bind(this, "qc_clientzip")}
          />
        </div>
        <div className="button-container-book">
          <button className="button-book" type="submit">
            Sign Up
          </button>
          <p>
            Already have an account? <a href="clientlogin.html">Sign In</a>
          </p>
        </div>
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

ReactDOM.render(<SignupBox />, document.getElementById("content"));
