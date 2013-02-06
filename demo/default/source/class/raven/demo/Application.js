/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(raven/demo/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "raven"
 */
qx.Class.define("raven.demo.Application",
{
  extend : qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      var DSN = "PASTE YOUR SENTRY DSN HERE"

      new raven.log.appender.Raven(DSN, true);

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Create a button
      var button1 = new raven.Contribution("First Contribution", "raven/test.png");

      // Document is the application root
      var doc = this.getRoot();

      // Add button to document at fixed coordinates
      doc.add(button1,
      {
        left : 100,
        top : 50
      });

      // Add an event listener
      button1.addListener("execute", function(e) {
        //test qooxdoo error
        button1.addListener();
      });

      //test native error
      throw Error();
    }
  }
});
