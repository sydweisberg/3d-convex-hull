# 3D Convex Hull
This GitHub Repository contains Molly Daniel and Sydney Weisberg's final project for CSC 372: Applied Algorithms.

## Installation and Run Instructions
1. Package Installation
- `pip install distance3d`
- `pip install scipy`
- `pip install flask`
- `pip install flask_cors`
2. Open two terminals
3. In one terminal run `python app.py`
4. In the second terminal run `python -m http.server 8000`
5. Open the server on http://localhost:8000/

## Visualization Instructions
- Press and hold left click to move around the 3D space
- Use the mouse scroll wheel to zoom in and out
- In "Edit" mode, you can add new points to an object using xyz coordinates by entering them in their respective boxes and clicking the `+ Add Point` button
- You can swap between the left and right objects by clicking the `Active` button
- If you would like to prepopulate an object with points forming a tetrahedron, click the `Sample Tetrahedron` button
- The `Reset View` button resets the view of the 3D space to what it originally was
- To go to collision detection mode, click the `Collision Mode` button
- You can drag the objects around by left clicking, holding, and moving them around
- The slider at the bottom of the screen moves the two objects closer together across the X coordinate
- The convex hull is automatically calculated, and if two objects collide, collision detection will trigger

## Project Description
The goal of this project is to implement a 3D convex Hull algorithm, develop a detection algorithm to see if two objects collide based on their convex hulls, and create a front-end visualizer.
### 3D Convex Hull
We will begin by implementing the naive algorithm O(n^4) to detect the convex hull of a 3D object. After, we will implement the incremental algorithm O(n^2). Finally, we will utilize a Python library such as Scipy to implement a better algorithm O(nlogn).
### Convex Hull Collisions
Using the convex hulls from two objects, found with an algorithm from the previous step, we will create an algorithm to detect if the two objects have collided. Our naive version of this approach will check to see if any of the points of one object appear inside of the convex hull of the other object. From there, we will look into more optimal approaches.
### Visualization
Finally, we will use AI to help us develop a front-end visualizer for our algorithms. Users will be able to place points for objects in 3D space by clicking their mouse. Users can move the 3D space around by dragging their mouse. There will be a slider on the bottom of the screen that will move the two objects to each side. If the objects collide, they will light up in red, if not they will light up in green.
