# 3d-convex-hull
Final project for Smith College CS 372 Applied Algorithms

# Installation and Run Instructions
1. Package Installation
- `pip install distance3d`
- `pip install scipy`
- `pip install flask`
- `pip install flask_cors`
2. Open two terminals
3. In one terminal run `python app.py`
4. In the second terminal run `python -m http.server 8000`
5. Open the server on http://localhost:8000/

# 3D Convex Hull Visualization
This implementation of 3D convex hull visualization is Sydney and Molly's final project for CSC 372: Applied Algorithms in Spring 2026.

## Project Description
The goal of this project is to implement a 3D convex Hull algorithm, develop a detection algorithm to see if two objects collide based on their convex hulls, and create a front-end visualizer.
### 3D Convex Hull
We will begin by implementing the naive algorithm O(n^4) to detect the convex hull of a 3D object. After, we will implement the incremental algorithm O(n^2). Finally, we will utilize a Python library such as Scipy to implement a better algorithm O(nlogn).
### Convex Hull Collisions
Using the convex hulls from two objects, found with an algorithm from the previous step, we will create an algorithm to detect if the two objects have collided. Our naive version of this approach will check to see if any of the points of one object appear inside of the convex hull of the other object. From there, we will look into more optimal approaches.
### Visualization
Finally, we will use AI to help us develop a front-end visualizer for our algorithms. Users will be able to place points for objects in 3D space by clicking their mouse. Users can move the 3D space around by dragging their mouse. There will be a slider on the bottom of the screen that will move the two objects to each side. If the objects collide, they will light up in red, if not they will light up in green.
