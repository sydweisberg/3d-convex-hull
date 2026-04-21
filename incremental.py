'''
References (Online Python Implementations)
- https://github.com/rgmyr/pyConvexHull3D/blob/master/hull3D.py
- https://github.com/yuehaowang/convex_hull_3d/blob/master/convex_hull.py

Overall complexity for Incremental 3D CH should be O(n^2)
'''

import numpy as np

def findOrientation(p1, p2, p3, p4):
    # Use homogeneous coordinates to compute signed volume of tetrahedron
    matrix = np.array([[p1[0], p1[1], p1[2], 1],
                       [p2[0], p2[1], p2[2], 1],
                       [p3[0], p3[1], p3[2], 1],
                       [p4[0], p4[1], p4[2], 1]])
    orientation = np.linalg.det(matrix)
    if orientation > 0:
        return 1
    elif orientation < 0:
        return -1
    else:
        return 0
    
def orientationHelper(face, point):
    # Fix orientation of a face
    if findOrientation(face[0], face[1], face[2], point) == 1:
        return (face[0], face[2], face[3])
    return face

def edgeFaceMap(faces):
    map = {}
    for face in faces:
        for u, v in [(face[0], face[1]), (face[1], face[2]), (face[2], face[0])]:
            key = tuple(sorted([u, v])) # Edges are undirected for CH problem
            if key not in map:
                map[key] = []
            map[key].append(face)
    return map
    
def buildHull(points):
    p1, p2, p3, p4 = points[:4]

    # Make sure the orientation of the base case tetrahedron is correct
    # This defines them in CCW orientation (faces are outwards)
    faces = [(p1, p2, p3), (p1, p3, p4), (p1, p4, p2), (p2, p4, p3)]

    # If the 4 points are coplanar, return
    if np.dot(np.cross(p2-p1, p3-p2), p1-p4) == 0:
        return

    faces[0] = orientationHelper(faces[0], p4)
    faces[1] = orientationHelper(faces[1], p2)
    faces[2] = orientationHelper(faces[2], p3)
    faces[3] = orientationHelper(faces[3], p1)

    for point in points[4:]:
        map = edgeFaceMap(faces)
    pass
    # TO-DO
    # Need to find the visible faces
    # Then find boundary edges (?), order them (?)
    # Remove visible faces
    # Create the new faces
    # Fix their orientations
    # Add them to hull
