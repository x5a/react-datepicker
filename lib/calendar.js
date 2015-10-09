var React = require( "react" );
var Day = require( "./day" );
var DateUtil = require( "./util/date" );
var map = require( "lodash/collection/map" );
var some = require( "lodash/collection/some" );

var Calendar = React.createClass( {displayName: "Calendar",
  mixins: [ require( "react-onclickoutside" ) ],

  propTypes: {
    weekdays: React.PropTypes.array.isRequired,
    locale: React.PropTypes.string,
    moment: React.PropTypes.func.isRequired,
    dateFormat: React.PropTypes.string.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    hideCalendar: React.PropTypes.func.isRequired,
    minDate: React.PropTypes.object,
    maxDate: React.PropTypes.object,
    excludeDates: React.PropTypes.array,
    weekStart: React.PropTypes.string.isRequired
  },

  handleClickOutside: function() {
    this.props.hideCalendar();
  },

  getInitialState: function() {
    return {
      date: new DateUtil( this.props.selected ).safeClone( this.props.moment() )
    };
  },

  getDefaultProps: function() {
    return {
      weekStart: "1"
    };
  },

  componentWillReceiveProps: function( nextProps ) {
    if ( nextProps.selected === null ) { return; }

    // When the selected date changed
    if ( nextProps.selected !== this.props.selected ) {
      this.setState( {
        date: new DateUtil( nextProps.selected ).clone()
      } );
    }
  },

  increaseMonth: function() {
    this.setState( {
      date: this.state.date.addMonth()
    } );
  },

  decreaseMonth: function() {
    this.setState( {
      date: this.state.date.subtractMonth()
    } );
  },

  weeks: function() {
    return this.state.date.mapWeeksInMonth( this.renderWeek );
  },

  handleDayClick: function( day ) {
    this.props.onSelect( day );
  },

  renderWeek: function( weekStart, key ) {
    if ( !weekStart.weekInMonth( this.state.date ) ) {
      return;
    }

    return (
      React.createElement("div", {key: key},
        this.days( weekStart)
      )
    );
  },

  renderDay: function( day, key ) {
    var minDate = new DateUtil( this.props.minDate ).safeClone(),
        maxDate = new DateUtil( this.props.maxDate ).safeClone(),
        excludeDates,
        disabled;

    if ( this.props.excludeDates && Array.isArray( this.props.excludeDates ) ) {
      excludeDates = map( this.props.excludeDates, function( date ) {
        return new DateUtil( date ).safeClone();
      } );
    }

    disabled = day.isBefore( minDate ) || day.isAfter( maxDate ) ||
      some( excludeDates, function( xDay ) { return day.sameDay( xDay ); } );

    return (
      React.createElement(Day, {
        key: key,
        day: day,
        date: this.state.date,
        onClick: this.handleDayClick.bind( this, day),
        selected: new DateUtil( this.props.selected),
        disabled: disabled})
    );
  },

  days: function( weekStart ) {
    return weekStart.mapDaysInWeek( this.renderDay );
  },

  header: function() {
    return this.props.moment.weekdaysMin().map( function( day, key ) {
      return React.createElement("div", {className: "datepicker__day", key: key}, day);
    } );
  },

  render: function() {
    return (
      React.createElement("div", {className: "datepicker"},
        React.createElement("div", {className: "datepicker__triangle"}),
        React.createElement("div", {className: "datepicker__header"},
          React.createElement("a", {className: "datepicker__navigation datepicker__navigation--previous",
              onClick: this.decreaseMonth}
          ),
          React.createElement("span", {className: "datepicker__current-month"},
            this.state.date.localeFormat( this.props.locale, this.props.dateFormat)
          ),
          React.createElement("a", {className: "datepicker__navigation datepicker__navigation--next",
              onClick: this.increaseMonth}
          ),
          React.createElement("div", null,
            this.header()
          )
        ),
        React.createElement("div", {className: "datepicker__month"},
          this.weeks()
        )
      )
    );
  }
} );

module.exports = Calendar;
