<!-- source: https://reagent-project.github.io/ | content-type: text/html; charset=utf-8 | bytes: 31394 -->

<div id="main-content">

<div>

<div>

<div class="nav">

- [Reagent:](index.html)
- [Intro](index.html)
- [News](news/index.html)
- [GitHub](https://github.com/reagent-project/reagent)
- [API](http://reagent-project.github.io/docs/master/)

</div>

<div class="reagent-demo">

# Reagent: Minimalistic React for ClojureScript

<div class="demo-text">

## Introduction to Reagent

[Reagent](https://github.com/reagent-project/reagent) provides a minimalistic interface between [ClojureScript](https://github.com/clojure/clojurescript) and [React](https://reactjs.org/). It allows you to define efficient React components using nothing but plain ClojureScript functions and data, that describe your UI using a [Hiccup](https://github.com/weavejester/hiccup)-like syntax.

The goal of Reagent is to make it possible to define arbitrarily complex UIs using just a couple of basic concepts, and to be fast enough by default that you rarely have to think about performance.

A very basic Reagent component may look something like this:

<div>

<div class="demo-example clearfix">

<span class="demo-example-hide">hide</span>

### Example

<div class="simple-demo">

<div>

I am a component!

I have **bold**<span style="color:red"> and red </span>text.

</div>

</div>

</div>

<div class="demo-source clearfix">

### Source

    (r/defc simple-component []
      [:div
       [:p "I am a component!"]
       [:p.someclass
        "I have " [:strong "bold"]
        [:span {:style {:color "red"}} " and red "] "text."]])

</div>

</div>

You can build new components using other components as building blocks. Like this:

<div>

<div class="demo-example clearfix">

<span class="demo-example-hide">hide</span>

### Example

<div class="simple-demo">

<div>

I include simple-component.

<div>

I am a component!

I have **bold**<span style="color:red"> and red </span>text.

</div>

</div>

</div>

</div>

<div class="demo-source clearfix">

### Source

    (r/defc simple-parent []
      [:div
       [:p "I include simple-component."]
       [simple-component]])

</div>

</div>

Data is passed to child components using plain old Clojure data types. Like this:

<div>

<div class="demo-example clearfix">

<span class="demo-example-hide">hide</span>

### Example

<div class="simple-demo">

Hello, world!

</div>

</div>

<div class="demo-source clearfix">

### Source

    (r/defc hello-component [name]
      [:p "Hello, " name "!"])

    (r/defc say-hello []
      [hello-component "world"])

</div>

</div>

**Note:** In the example above, `hello-component` might just as well have been called as a normal Clojure function instead of as a Reagent component, i.e with parenthesis instead of square brackets. The only difference would have been performance, since ”real” Reagent components are only re-rendered when their data have changed. More advanced components though (see below) must be called with square brackets.

Here is another example that shows items in a `seq`:

<div>

<div class="demo-example clearfix">

<span class="demo-example-hide">hide</span>

### Example

<div class="simple-demo">

<div>

Here is a list:

- Item 0
- Item 1
- Item 2

</div>

</div>

</div>

<div class="demo-source clearfix">

### Source

    (r/defc lister [items]
      [:ul
       (for [item items]
         ^{:key item} [:li "Item " item])])

    (r/defc lister-user []
      [:div
       "Here is a list:"
       [lister (range 3)]])

</div>

</div>

**Note:** The `^{:key item}` part above isn’t really necessary in this simple example, but attaching a unique key to every item in a dynamically generated list of components is good practice, and helps React to improve performance for large lists. The key can be given either (as in this example) as meta-data, or as a `:key` item in the first argument to a component (if it is a map). See React’s [documentation](https://reactjs.org/docs/lists-and-keys.html#keys) for more info.

</div>

<div class="demo-text">

## Managing state in Reagent

The easiest way to manage state in Reagent is to use Reagent’s own version of `atom`. It works exactly like the one in clojure.core, except that it keeps track of every time it is deref’ed. Any component that uses an `atom` is automagically re-rendered when its value changes.

Let’s demonstrate that with a simple example:

<div>

<div class="demo-example clearfix">

<span class="demo-example-hide">hide</span>

### Example

<div class="simple-demo">

<div>

The atom `click-count` has value: 0.

</div>

</div>

</div>

<div class="demo-source clearfix">

### Source

    (ns example
      (:require [reagent.core :as r]))

    (def click-count (r/atom 0))

    (r/defc counting-component []
      [:div
       "The atom " [:code "click-count"] " has value: "
       @click-count ". "
       [:input {:type "button" :value "Click me!"
                :on-click #(swap! click-count inc)}]])

</div>

</div>

Sometimes you may want to maintain state locally in a component. That is easy to do with an `atom` as well.

Here is an example of that, where we call `setTimeout` every time the component is rendered to update a counter:

<div>

<div class="demo-example clearfix">

<span class="demo-example-hide">hide</span>

### Example

<div class="simple-demo">

<div>

Seconds Elapsed: 0

</div>

</div>

</div>

<div class="demo-source clearfix">

### Source

    (defn timer-component []
      (let [seconds-elapsed (r/atom 0)]
        (fn []
          (js/setTimeout #(swap! seconds-elapsed inc) 1000)
          [:div
           "Seconds Elapsed: " @seconds-elapsed])))

</div>

</div>

The previous example also uses another feature of Reagent: a component function can return another function, that is used to do the actual rendering. This function is called with the same arguments as the first one.

This allows you to perform some setup of newly created components without resorting to React’s lifecycle events.

By simply passing an `atom` around you can share state management between components, like this:

<div>

<div class="demo-example clearfix">

<span class="demo-example-hide">hide</span>

### Example

<div class="simple-demo">

<div>

The value is now: foo

Change it here:

</div>

</div>

</div>

<div class="demo-source clearfix">

### Source

    (ns example
      (:require [reagent.core :as r]))

    (r/defc atom-input [value]
      [:input {:type "text"
               :value @value
               :on-change #(reset! value (-> % .-target .-value))}])

    (defn shared-state []
      (let [val (r/atom "foo")]
        (fn []
          [:div
           [:p "The value is now: " @val]
           [:p "Change it here: " [atom-input val]]])))

</div>

</div>

**Note:** Component functions can be called with any arguments – as long as they are immutable. You *could* use mutable objects as well, but then you have to make sure that the component is updated when your data changes. Reagent assumes by default that two objects are equal if they are the same object.

</div>

<div class="demo-text">

## Essential API

Reagent supports most of React’s API, but there is really only one entry-point that is necessary for most applications: `reagent.dom/render`.

It takes two arguments: a component, and a DOM node. For example, splashing the very first example all over the page would look like this:

<div>

<div class="demo-source clearfix">

### Source

    (ns example
      (:require [reagent.dom :as rdom]))

    (r/defc simple-component []
      [:div
       [:p "I am a component!"]
       [:p.someclass
        "I have " [:strong "bold"]
        [:span {:style {:color "red"}} " and red "] "text."]])

</div>

</div>

</div>

<div class="demo-text">

## Putting it all together

Here is a slightly less contrived example: a simple BMI calculator.

Data is kept in a single `reagent.core/atom`: a map with height, weight and BMI as keys.

<div>

<div class="demo-example clearfix">

<span class="demo-example-hide">hide</span>

### Example

<div class="simple-demo">

<div>

### BMI calculator

<div>

Height: 180cm

</div>

<div>

Weight: 80kg

</div>

<div>

BMI: 24 <span style="color:inherit">normal</span>

</div>

</div>

</div>

</div>

<div class="demo-source clearfix">

### Source

    (ns example
      (:require [reagent.core :as r]))

    (defn calc-bmi [{:keys [height weight bmi] :as data}]
      (let [h (/ height 100)]
        (if (nil? bmi)
          (assoc data :bmi (/ weight (* h h)))
          (assoc data :weight (* bmi h h)))))

    (def bmi-data (r/atom (calc-bmi {:height 180 :weight 80})))

    (r/defc slider [param value min max invalidates]
      [:input {:type "range" :value value :min min :max max
               :style {:width "100%"}
               :on-change (fn [e]
                            (let [new-value (js/parseInt (.. e -target -value))]
                              (swap! bmi-data
                                     (fn [data]
                                       (-> data
                                         (assoc param new-value)
                                         (dissoc invalidates)
                                         calc-bmi)))))}])

    (r/defc bmi-component []
      (let [{:keys [weight height bmi]} @bmi-data
            [color diagnose] (cond
                              (< bmi 18.5) ["orange" "underweight"]
                              (< bmi 25) ["inherit" "normal"]
                              (< bmi 30) ["orange" "overweight"]
                              :else ["red" "obese"])]
        [:div
         [:h3 "BMI calculator"]
         [:div
          "Height: " (int height) "cm"
          [slider :height height 100 220 :bmi]]
         [:div
          "Weight: " (int weight) "kg"
          [slider :weight weight 30 150 :bmi]]
         [:div
          "BMI: " (int bmi) " "
          [:span {:style {:color color}} diagnose]
          [slider :bmi bmi 10 50 :weight]]]))

</div>

</div>

</div>

<div class="demo-text">

## Performance

React itself is very fast, and so is Reagent. In fact, Reagent will be even faster than plain React a lot of the time, thanks to optimizations made possible by ClojureScript.

Mounted components are only re-rendered when their parameters have changed. The change could come from a deref’ed `atom`, the arguments passed to the component or component state.

All of these are checked for changes with `identical?` which is basically only a pointer comparison, so the overhead is very low. Maps passed as arguments to components are compared the same way: they are considered equal if all their entries are identical. This also applies to built-in React components like `:div`, `:p`, etc.

All this means that you simply won’t have to care about performance most of the time. Just define your UI however you like – it will be fast enough.

There are a couple of situations that you might have to care about, though. If you give Reagent a big `seq` of components to render, you might have to supply all of them with a unique `:key` attribute to speed up rendering (see above). Also note that anonymous functions are not, in general, equal to each other even if they represent the same code and closure.

But again, in general you should just trust that React and Reagent will be fast enough. This very page is composed of a single Reagent component with thousands of child components (every single parenthesis etc in the code examples is a separate component), and yet the page can be updated many times every second without taxing the browser the slightest.

Incidentally, this page also uses another React trick: the entire page is pre-rendered using Node, and `reagent.dom.server/render-to-string`. When it is loaded into the browser, React automatically attaches event-handlers to the already present DOM tree.

</div>

</div>

<a href="https://github.com/reagent-project/reagent" class="github-badge"><img src="https://github.blog/wp-content/uploads/2008/12/forkme_left_orange_ff7600.png" style="position:absolute;top:0;left:0;border:0" width="149" height="149" alt="Fork me on GitHub" /></a>

</div>

</div>

</div>
