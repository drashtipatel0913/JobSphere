import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Mobile = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const $ = window.jQuery; // Access jQuery from window

    const mmenuInit = () => {
      var wi = $(window).width();
      if (wi <= 1099) {
        $(".mmenu-init").remove();
        $("#navigation").clone().addClass("mmenu-init")
          .insertBefore("#navigation").removeAttr('id')
          .removeClass('style-1 style-2')
          .find('ul, div').removeClass('style-1 style-2 mega-menu mega-menu-content mega-menu-section')
          .removeAttr('id');
        $(".mmenu-init").find("ul").addClass("mm-listview");
        $(".mmenu-init").find(".mobile-styles .mm-listview").unwrap();

        $(".mmenu-init").mmenu({
          "counters": true
        }, {
          offCanvas: {
            pageNodetype: "#wrapper"
          }
        });

        var mmenuAPI = $(".mmenu-init").data("mmenu");
        $(".mmenu-trigger").on('click', function (e) {
          e.preventDefault();
          mmenuAPI.open();
        });
      }
      $(".mm-next").addClass("mm-fullsubopen");
       // Handling navigation:
       $(".mmenu-init a").on('click', function (e) {
        e.preventDefault(); // Prevent default anchor behavior
        const targetPath = $(this).attr('href').replace('#', ''); // Remove hash if present (as used in your HTML)
        navigate(targetPath); // Use React Router's navigate function
        mmenuAPI.close(); // Close menu after navigation
      });
    };

    mmenuInit();
    $(window).on('resize', mmenuInit);

    return () => {
      $(window).off('resize', mmenuInit);
    };
  }, []);
  return (
    <span className="mmenu-trigger">
      <button className="hamburger hamburger--collapse" type="button">
        <span className="hamburger-box">
          <span className="hamburger-inner"></span>
        </span>
      </button>
    </span>
  );
};

export default Mobile;
