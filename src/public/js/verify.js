window.addEventListener('DOMContentLoaded', async () => {
  // Read query parameters from the URL
    const params= new URLSearchParams(window.location.search);

  // Example: /verify?id=123&token=abc
  // Extract values from the URL
    const id=params.get('id');
    const token=params.get('token');

  // Get UI elements for different states
  const loading=document.querySelector('.state.loading');
  const success=document.querySelector('.state.success');
  const error=document.querySelector('.state.error');
 
//trycatch for genral error handeling

try {
    // Send verification request to backend
    const response = await fetch('/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, token })
    });
// Hide loading spinner once request finishes
    // If backend responds with error status (4xx / 5xx)
    if (!response.ok) {
        const errorData = await response.json();
        error.style.display='block';
        error.querySelector("p").innerText= errorData.message || "Verification failed.";
        loading.style.display='none';
        success.style.display='none';
        return;
    }
    // If verification is successful
    success.style.display='block';
    loading.style.display='none';
    error.style.display='none';
    
        ///update only message texty (keep layout intact)
    // If verification is successful
    
} catch (err) {
    loading.style.display='none';
    success.style.display='none';
    error.style.display='block';
    error.querySelector("p").innerText= err.message || "An error occurred during verification.";
}
   

})