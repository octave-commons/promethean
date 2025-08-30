"""Embedding utilities such as a minimal PCA implementation."""

from typing import Optional

import numpy as np


class PCA:
    """Minimal principal component analysis transformer."""

    def __init__(self, n_components: int = 1):
        """Initialise the transformer with ``n_components`` dimensions."""
        self.mean: Optional[np.ndarray] = None
        self.eig_vectors: Optional[np.ndarray] = None
        self.n_components = n_components

    def build(self, x: np.ndarray) -> np.ndarray:
        """Fit PCA to ``x`` and return the projected data."""
        m = np.mean(x, axis=0)
        xm = x - m
        cov_mat = np.cov(xm.T)
        eig_values, eig_vectors = np.linalg.eig(cov_mat)

        idx = np.argsort(eig_values)[::-1]
        eig_vectors = eig_vectors[:, idx]
        v = eig_vectors[:, : self.n_components]
        projection = xm.dot(v)

        self.eig_vectors = eig_vectors
        self.mean = m
        return projection

    def project(self, x: np.ndarray) -> np.ndarray:
        """Project ``x`` using the fitted components."""
        if self.mean is None or self.eig_vectors is None:
            raise ValueError("PCA model has not been fitted")
        xm = x - self.mean
        v = self.eig_vectors[:, : self.n_components]
        return xm.dot(v)

    def iproject(self, z: np.ndarray) -> np.ndarray:
        """Inverse transform ``z`` back to the original space."""
        if self.mean is None or self.eig_vectors is None:
            raise ValueError("PCA model has not been fitted")
        v = self.eig_vectors[:, : self.n_components]
        x = z * v.T + self.mean
        return x
