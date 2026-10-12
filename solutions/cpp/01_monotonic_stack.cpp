#include <vector>
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
