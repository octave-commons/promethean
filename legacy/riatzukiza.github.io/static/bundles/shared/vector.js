require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@shared/vector.js":[function(require,module,exports){
/*
  Johan Karlsson
  https://github.com/DonKarlssonSan/vectory
  MIT License, see Details View

*/

"use strict";

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector(
      this.x + v.x,
      this.y + v.y);
  }

  addTo(v) {
    this.x += v.x;
    this.y += v.y;
  }

  sub(v) {
    return new Vector(
      this.x - v.x,
      this.y - v.y);
  }
  
  subFrom(v) {
    this.x -= v.x;
    this.y -= v.y;
  }
  
  mult(n) {
    return new Vector(this.x * n, this.y * n);
  }
  
  multTo(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }
  
  div(n) {
    return new Vector(this.x / n, this.y / n);
  }
  
  divTo(n) {
    this.x /= n;
    this.y /= n;
  }
  
  setAngle(angle) {
    var length = this.getLength();
    this.x = Math.cos(angle) * length;
    this.y = Math.sin(angle) * length;
  }
  
  setLength(length) {
    var angle = this.getAngle();
    this.x = Math.cos(angle) * length;
    this.y = Math.sin(angle) * length;
  }
  
  getAngle() {
    return Math.atan2(this.y, this.x);
  }
  
  getLength() {
    return Math.hypot(this.x, this.y);
  }

  getLengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  distanceTo(v) {
    return this.sub(v).getLength();
  }
  
  distanceToSq(v) {
    return this.sub(v).getLengthSq();
  }

  manhattanDistanceTo(v) {
    return Math.abs(v.x - this.x) + Math.abs(v.y - this.y);
  }
  
  copy() {
    return new Vector(this.x, this.y);
  }
  
  rotate(angle) {
    return new Vector(this.x * Math.cos(angle) - this.y * Math.sin(angle), this.x * Math.sin(angle) + this.y * Math.cos(angle));
  }
  
  rotateTo(angle) {
    let x = this.x * Math.cos(angle) - this.y * Math.sin(angle); 
    let y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
    this.x = x;
    this.y = y;
    return this;
  }
  
  rotateAround(v, angle) {
    let x = (this.x - v.x) * Math.cos(angle) - (v.y - this.y) * Math.sin(angle) + v.x;
    let y = (this.x - v.x) * Math.sin(angle) + (v.y - this.y) * Math.cos(angle) + v.y;
    return new Vector(x, y);
  }

  rotateMeAround(v, angle) {
    let x = (this.x - v.x) * Math.cos(angle) - (v.y - this.y) * Math.sin(angle) + v.x;
    let y = (this.x - v.x) * Math.sin(angle) + (v.y - this.y) * Math.cos(angle) + v.y;
    this.x = x;
    this.y = y;
    return this;
  }
  
  equals(v) {
    return this.x == v.x && this.y == v.y;
  }
}
module.exports = Vector

function createField(columns,rows) {
  let field = new Array(columns);
  for(let x = 0; x < columns; x++) {
    field[x] = new Array(columns);
    for(let y = 0; y < rows; y++) {
      field[x][y] = new Vector(0, 0);
    }
  }
  return field
}

},{}]},{},[]);
