export const setupVideo = (element,stream) =>{
    element.src = window.URL.createObjectURL(stream);
    element.play();
}