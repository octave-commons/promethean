# Shared.Grid.Grid-view

## arguments

None

## description

A generic interface for accessing subsections of a grid.
Expects an implementation of:
- Cells: A list of cells in the grid that are in the view area.
- grid: The grid this is a view into.
- grid-x: The x coordinate of the origin cell of the grid.
- grid-y: The y coordinate of the origin cell of the grid.
- get(x, y): An accessor method for locating cells with in the grid-view.