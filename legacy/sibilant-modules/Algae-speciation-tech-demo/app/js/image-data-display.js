const { 
  create,
  extend,
  mixin
 } = require("./util");
const { 
  StateSpace
 } = require("./state-space");
// const Display = { 
//   symbol:Symbol("Display"),
//   init( width = this.width,height = this.height,cellSize = this.cellSize,ctx = this.ctx,imageData = ctx.getImageData() ){ 
//     
//       this.width = width;this.height = height;this.cellSize = cellSize;this.ctx = ctx;this.imageData = imageData;
//       return this;
//     
//    },
//   resize( width = this.width,height = this.height,cellSize = this.cellSize,ctx = this.ctx ){ 
//     
//       Display.init.call(this, width, height, cellSize, ctx);
//       return this;
//     
//    },
//   randomize(  ){ 
//     
//       "generate a random field of pixels for the display";
//       return this.transit((color, pos) => {
//       	
//         return { 
//           red:(Math.floor((Math.random() * (256 - 0))) + 0),
//           green:(Math.floor((Math.random() * (256 - 0))) + 0),
//           blue:(Math.floor((Math.random() * (256 - 0))) + 0)
//          };
//       
//       });
//     
//    },
//   clear(  ){ 
//     
//       "set the display to black";
//       return this.transit((color, pos) => {
//       	
//         return { 
//           red:0,
//           green:0,
//           blue:0
//          };
//       
//       });
//     
//    },
//   set( x = this.x,y = this.y,color = this.color,imageData = this.imageData,width = this.width,height = this.height,cellSize = this.cellSize ){ 
//     "set the transition value of the pixel at the given x and y."// for (let time = 0;time < (cellSize * cellSize);++(time)){
//     // imageData[((x * width * time) + y + 0)] = color.red;;
//     // imageData[((x * width * time) + y + 1)] = color.green;;
//     // imageData[((x * width * time) + y + 2)] = color.blue;;
//     // imageData[((x * width * time) + y + 3)] = 0;}
//    },
//   get( x = this.x,y = this.y,wdith = this.wdith,height = this.height ){ 
//     imageData[((x * width) + y + 0)]imageData[((x * width) + y + 1)]imageData[((x * width) + y + 2)]imageData[((x * width) + y + 3)]
//    },
//   update( ctx = this.ctx ){ 
//     
//       "swap the transition and the state matricies for all red green and blue.";
//       this.imageData = ctx.getImageData();
//       return this;
//     
//    },
//   render( ctx = this.ctx,imageData = this.imageData ){ 
//     
//       "load the current state into the canvas";
//       ctx.putImageData(imageData);
//       return this;
//     
//    }
//  };
// exports.Display = Display;