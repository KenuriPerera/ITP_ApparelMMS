import React, { Component } from 'react';
import Navbar from '../Nav/Navbar';
import backgroundImage from '../Images/logo.png'; // Ensure your path is correct

export default class Home1 extends Component {
  render() {
    return (
      <div 
        style={{
          backgroundImage: `url(${backgroundImage})`, // Dynamically set the background image
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          height: '100vh' // You can adjust the height as per your need
        }}
      >
        <Navbar />
      </div>
    );
  }
}
