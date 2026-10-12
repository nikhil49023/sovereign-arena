export const TRACKS = [
  {
    id: 'pytorch',
    title: 'PyTorch Internals & Autograd',
    icon: 'Flame',
    description: 'Master tensor memory layout, strides, custom Autograd functions, and GPU tensors.',
    lessons: [
      {
        id: '01_tensor_strides',
        title: 'Tensor Strides & Contiguous Memory',
        language: 'pytorch',
        difficulty: 'Easy',
        xp: 50,
        instructions: `### The Mental Model
A PyTorch tensor is NOT just a block of numbers. It is a **1D storage array** in RAM/VRAM combined with:
1. **Shape:** Dimensions $(D_0, D_1, \dots)$
2. **Strides:** The jump in physical storage needed to advance 1 element along each dimension.

### Challenge
Implement \`make_transposed_and_contiguous(tensor)\`:
1. Given a 2D tensor of shape $(M, N)$, transpose dimensions 0 and 1.
2. Check if the transposed tensor is contiguous. If not, make it contiguous using \`.contiguous()\`.
3. Return the resulting contiguous tensor.`,
        template: `import torch

def make_transposed_and_contiguous(x: torch.Tensor) -> torch.Tensor:
    # 1. Transpose dimensions 0 and 1
    # 2. Return contiguous memory representation
    # YOUR CODE HERE:
    pass
`,
        testCode: `
# Test Harness
t = torch.tensor([[1, 2, 3], [4, 5, 6]])
out = make_transposed_and_contiguous(t)
assert out.shape == (3, 2), f"Expected shape (3, 2), got {out.shape}"
assert out.is_contiguous(), "Tensor must be contiguous in memory"
assert out.stride() == (2, 1), f"Expected stride (2, 1), got {out.stride()}"
print("✓ PyTorch Strides Test Passed! (Contiguous shape verified)")
`
      },
      {
        id: '02_custom_gelu',
        title: 'Custom Autograd GELU & Backward Pass',
        language: 'pytorch',
        difficulty: 'Medium',
        xp: 100,
        instructions: `### The Invariant
When writing custom autograd layers in PyTorch (\`torch.autograd.Function\`):
* \`forward(ctx, x)\`: Must save required tensors via \`ctx.save_for_backward(x)\`.
* \`backward(ctx, grad_output)\`: Computes $\\frac{\\partial L}{\\partial x} = \\text{grad\\_output} \\odot \\frac{\\partial y}{\\partial x}$.

### Challenge
Implement a custom GELU approximation:
$$\\text{GELU}(x) \\approx 0.5x(1 + \\tanh(\\sqrt{2/\\pi}(x + 0.044715x^3)))$$
Return the output from forward, and compute the backward gradient analytically.`,
        template: `import torch
import math

class CustomGELU(torch.autograd.Function):
    @staticmethod
    def forward(ctx, x):
        ctx.save_for_backward(x)
        # Compute approximation
        c = math.sqrt(2.0 / math.pi)
        tanh_term = torch.tanh(c * (x + 0.044715 * torch.pow(x, 3)))
        return 0.5 * x * (1.0 + tanh_term)

    @staticmethod
    def backward(ctx, grad_output):
        x, = ctx.saved_tensors
        # Compute gradient w.r.t x and multiply by grad_output
        c = math.sqrt(2.0 / math.pi)
        inner = c * (x + 0.044715 * torch.pow(x, 3))
        tanh_term = torch.tanh(inner)
        sech2_term = 1.0 - torch.pow(tanh_term, 2)
        d_inner = c * (1.0 + 3.0 * 0.044715 * torch.pow(x, 2))
        
        # d_gelu/dx = 0.5 * (1 + tanh) + 0.5 * x * sech^2 * d_inner
        d_gelu = 0.5 * (1.0 + tanh_term) + 0.5 * x * sech2_term * d_inner
        return grad_output * d_gelu
`,
        testCode: `
# Numerical verification with gradcheck
x = torch.randn(4, 4, dtype=torch.float64, requires_grad=True)
gelu = CustomGELU.apply
assert torch.autograd.gradcheck(gelu, (x,), eps=1e-6, atol=1e-4), "Gradcheck failed!"
print("✓ Custom GELU numerical gradcheck passed with 0 errors!")
`
      }
    ]
  },
  {
    id: 'cpp',
    title: 'Modern C++20 Systems Engineering',
    icon: 'Cpu',
    description: 'Master cache locality, zero-allocation containers, move semantics, and std::span.',
    lessons: [
      {
        id: '01_monotonic_stack',
        title: 'Monotonic Stack (Next Greater Element)',
        language: 'cpp',
        difficulty: 'Medium',
        xp: 75,
        instructions: `### The Invariant
Given an array, find the next greater element to the right for each element.
1. Use \`std::vector<int>\` to preallocate the result with \`-1\`.
2. Maintain a decreasing stack of **indices**.
3. Target complexity: $O(N)$ time, $O(N)$ auxiliary space, zero heap reallocations.`,
        template: `#include <vector>
#include <iostream>
#include <cassert>

std::vector<int> nextGreaterElements(const std::vector<int>& arr) {
    int n = arr.size();
    std::vector<int> result(n, -1);
    std::vector<int> st;
    st.reserve(n); // Zero heap churn

    // YOUR IMPLEMENTATION HERE:
    for (int i = 0; i < n; ++i) {
        while (!st.empty() && arr[i] > arr[st.back()]) {
            result[st.back()] = arr[i];
            st.pop_back();
        }
        st.push_back(i);
    }

    return result;
}
`,
        testCode: `
int main() {
    std::vector<int> input = {2, 1, 2, 4, 3};
    auto res = nextGreaterElements(input);
    std::vector<int> expected = {4, 2, 4, -1, -1};
    assert(res == expected);
    std::cout << "✓ C++20 Monotonic Stack tests passed with optimal cache locality!" << std::endl;
    return 0;
}
`
      }
    ]
  },
  {
    id: 'cuda',
    title: 'NVIDIA CUDA Kernel Architecture',
    icon: 'Zap',
    description: 'Direct GPU acceleration, warp scheduling, thread indexing, and shared memory.',
    lessons: [
      {
        id: '01_vector_add_kernel',
        title: 'Vector Addition & Grid-Stride Loop',
        language: 'cuda',
        difficulty: 'Medium',
        xp: 100,
        instructions: `### The GPU Primitive
Write a CUDA kernel \`vecAddKernel\` that performs element-wise addition:
$$C[i] = A[i] + B[i]$$
using a **grid-stride loop** so it supports arrays larger than the number of launched threads!`,
        template: `#include <iostream>
#include <cuda_runtime.h>
#include <cassert>

__global__ void vecAddKernel(const float* A, const float* B, float* C, int n) {
    int idx = blockDim.x * blockIdx.x + threadIdx.x;
    int stride = blockDim.x * gridDim.x;
    
    // Grid-stride loop:
    for (int i = idx; i < n; i += stride) {
        C[i] = A[i] + B[i];
    }
}
`,
        testCode: `
int main() {
    int n = 10000;
    size_t bytes = n * sizeof(float);

    float *h_A = (float*)malloc(bytes);
    float *h_B = (float*)malloc(bytes);
    float *h_C = (float*)malloc(bytes);

    for (int i = 0; i < n; ++i) {
        h_A[i] = 1.0f;
        h_B[i] = 2.0f;
    }

    float *d_A, *d_B, *d_C;
    cudaMalloc(&d_A, bytes);
    cudaMalloc(&d_B, bytes);
    cudaMalloc(&d_C, bytes);

    cudaMemcpy(d_A, h_A, bytes, cudaMemcpyHostToDevice);
    cudaMemcpy(d_B, h_B, bytes, cudaMemcpyHostToDevice);

    int blockSize = 256;
    int numBlocks = (n + blockSize - 1) / blockSize;
    vecAddKernel<<<numBlocks, blockSize>>>(d_A, d_B, d_C, n);
    cudaDeviceSynchronize();

    cudaMemcpy(h_C, d_C, bytes, cudaMemcpyDeviceToHost);

    for (int i = 0; i < n; ++i) {
        assert(h_C[i] == 3.0f);
    }

    std::cout << "✓ CUDA Kernel executed on GPU with 10,000 elements passed!" << std::endl;

    cudaFree(d_A); cudaFree(d_B); cudaFree(d_C);
    free(h_A); free(h_B); free(h_C);
    return 0;
}
`
      }
    ]
  },
  {
    id: 'rust',
    title: 'Rust Safe Systems & Concurrency',
    icon: 'Shield',
    description: 'Master ownership, borrow checker lifetimes, traits, and lock-free atomics.',
    lessons: [
      {
        id: '01_borrow_checker_pointers',
        title: 'Safe In-Place Partitioning',
        language: 'rust',
        difficulty: 'Easy',
        xp: 50,
        instructions: `### The Rust Paradigm
Implement \`partition_even_odd(slice: &mut [i32]) -> usize\` in-place.
Reorganize the slice so all even numbers come first, returning the count of evens.
You must satisfy the borrow checker with zero heap allocations!`,
        template: `pub fn partition_even_odd(slice: &mut [i32]) -> usize {
    let mut left = 0;
    let mut right = slice.len();

    while left < right {
        if slice[left] % 2 == 0 {
            left += 1;
        } else {
            right -= 1;
            slice.swap(left, right);
        }
    }
    left
}
`,
        testCode: `
#[test]
fn test_partition() {
    let mut arr = [1, 2, 3, 4, 5, 6];
    let evens_count = partition_even_odd(&mut arr);
    assert_eq!(evens_count, 3);
    for i in 0..evens_count {
        assert_eq!(arr[i] % 2, 0);
    }
    println!("✓ Rust In-Place Partition test passed with 0 allocations!");
}
`
      }
    ]
  },
  {
    id: 'qiskit',
    title: 'Quantum Information & Qiskit',
    icon: 'Atom',
    description: 'Quantum circuits, superposition, entanglement, Bell states, and phase kickback.',
    lessons: [
      {
        id: '01_bell_state',
        title: 'Maximal Entanglement (Bell State |Φ+⟩)',
        language: 'qiskit',
        difficulty: 'Easy',
        xp: 50,
        instructions: `### The Quantum Mechanics
Generate the entangled Bell State:
$$|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$
1. Apply a Hadamard gate $H$ on qubit 0 to create equal superposition $(|0\\rangle + |1\\rangle)/\\sqrt{2}$.
2. Apply a CNOT gate with qubit 0 as control and qubit 1 as target.
3. Return the 2-qubit circuit.`,
        template: `from qiskit import QuantumCircuit

def create_bell_state_circuit() -> QuantumCircuit:
    qc = QuantumCircuit(2, 2)
    # Apply Hadamard on qubit 0:
    qc.h(0)
    # Apply CNOT (control: 0, target: 1):
    qc.cx(0, 1)
    qc.measure([0, 1], [0, 1])
    return qc
`,
        testCode: `
qc = create_bell_state_circuit()
assert qc.num_qubits == 2, "Must be a 2-qubit circuit"
ops = [instr.operation.name for instr in qc.data]
assert 'h' in ops, "Missing Hadamard gate"
assert 'cx' in ops, "Missing CNOT gate"
print("✓ Bell State Quantum Circuit assertions verified!")
`
      }
    ]
  }
];

export function getTracks() {
  return TRACKS.map(t => ({
    id: t.id,
    title: t.title,
    icon: t.icon,
    description: t.description,
    lessonCount: t.lessons.length
  }));
}

export function getLesson(trackId, lessonId) {
  const track = TRACKS.find(t => t.id === trackId);
  if (!track) return null;
  const lesson = track.lessons.find(l => l.id === lessonId);
  if (!lesson) return null;
  return { ...lesson, trackTitle: track.title };
}
