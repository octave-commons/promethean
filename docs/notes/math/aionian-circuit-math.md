Focused Aionian (Circuit 1) toolkit: rhythm, energy budget, watchdog, instability, stabilization, and field coupling.

### Pulse rhythm (damped)
$$ x(t) = A e^{-\lambda t} \cos(2\pi f t + \phi) ```
### Energy budget
``` \tfrac{dE}{dt} = I(t) - C(t), \quad E<\theta_{panic} \Rightarrow \text{suspend} ```
### Alive watchdog
``` L(t)=\begin{cases}1 & \exists\,\text{tick in } [t-\Delta,t]\\0 & \text{otherwise}\end{cases} ```
### Instability index
``` \Xi = \sigma_{tick}/\mu_{tick} + \tfrac{dropouts}{n} + \eta ```
### Stabilization curve
``` x(t) = x_0 (1 - e^{-k t}) ```
### Heartbeat–field coupling
``` f(t) = f_0 + \alpha \cdot \mathcal{T}(t), \quad \mathcal{T}(t)= \int \|\nabla\Phi(\vec{x},t)\|^2 d\vec{x} $
Related: [eidolon-field-math], [homeostasis-and-decay-models], [field-dynamics-math-blocks] [../../unique/index|unique/index]

#tags: #math #theory #aionian

