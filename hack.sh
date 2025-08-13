I'm gonna make a age a bmout a taco shop where you eat all the tacos and you have this one thing.. like you know what I mean but.. its I know what it is.


It's a game about a taco shack. We sell tacos, there is money. There is a street.

(def location (x y z) (object x y z))

(def bounding-box (pos height width depth))

(def game-map (height width depth))

(def place-building ((pos:location) building game-map))
(def building ((pos:location) (box: bounding-box) door-location)
 (object (pos pos) (box box)))

(var my-first-taco-shack (building (location 1 2 3)  (bounding-box 10 10 10)))

(def taco-shack ((pos: location) menu size)
 (place-building (build location 10 10 10 5)))
