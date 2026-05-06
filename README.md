# 3D Convex Hull
This GitHub Repository contains Molly Daniel and Sydney Weisberg's final project for CSC 372: Applied Algorithms.

## Project Description
The goal of this project is to develop a visualization program for 3D convex hull detection. We implemented three different convex hull algorithms - Naive Extreme Faces O(n^4), Randomized Incremental O(n^2), and QuickHull O(nlogn). We manually implemented both the naive algorithm and the incremental one, and used the scipy package for QuickHull. We additionally implemented a point-in-3D-hull algorithm to detect collisions. Finally, we modified Claude code to develop a frontend visualization program that uses our algorithms to build a convex hull and detect collisions.

## Installation and Run Instructions
1. Package Installation
- `pip install distance3d`
- `pip install scipy`
- `pip install flask`
- `pip install flask_cors`

  or
- `pip install -r requirements.txt`
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

## Project and Algorithm Overview
A convex hull is a set of points that forms a convex polygon of a list of all points. In 3D, the convex hull forms a convex polyhedron. Convex hulls are useful in many different fields, and have applications in robotics, image processing, data clustering, and mapping. Collision detection is another use case of convex hulls as it allows for more efficient tests due to the simplification of more complicated objects in 3D. Our contribution to this problem is an implementation of three different convex hull algorithms, two collision detection algorithms, and an AI-assisted visualization in 3D.
### Algorithms
#### Naive Convex Hull
Input: List of points

Output Faces of the convex hull
#### Incremental Convex Hull
Input: List of points

Output: Faces of the convex hull
#### Quickhull
Input: List of points

Output: Convex hull object (simplicies, vertices)
#### Naive Intersection
Input: Two points of two convex hulls

Output: Boolean, true if intersection, false if not
### GJK
Input: Points from the left and right convex hulls, position offsets of each convex hull

Output: Boolean, true if collision, false if not, and distance between objects
### Work Breakdown
We both contributed equally to this project. Molly focused on implementing the naive convex hull algorithm, naive intersection, and GJK. Sydney focused on implementing incremental convex hull. We both worked on implementations of quickhull, and took turns contributing to the visualization. Finally, we checked each others work, and communicated througout the project about design and implementation decisions regardless of the specific algorithm we were working on. The work and time spent on the project was split 50/50.
### Sources
- CSC 372 Homework 5 (foundation of convex hull understanding)
- CSC 372 Homework 6 (orientation test primatives)
- https://github.com/rgmyr/pyConvexHull3D/blob/master/hull3D.py (incremental convex hull)
- https://github.com/yuehaowang/convex_hull_3d/blob/master/convex_hull.py (incremental convex hull)
- https://claude.ai/ (visualization, incremental convex hull)
