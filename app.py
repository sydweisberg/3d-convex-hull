from flask import Flask, request, jsonify
from flask_cors import CORS
from scipy.spatial import ConvexHull
import numpy as np

app = Flask(__name__)
CORS(app)

def to_np(points):
    return np.array(points)

@app.route("/hull", methods=["POST"])
def hull():
    data = request.json

    def compute(obj):
        pts = to_np(obj)
        if len(pts) < 4:
            return None

        hull = ConvexHull(pts)

        return {
            "vertices": pts.tolist(),
            "simplices": hull.simplices.tolist()
        }

    return jsonify({
        "hull1": compute(data["object1"]),
        "hull2": compute(data["object2"])
    })

if __name__ == "__main__":
    app.run(debug=True)