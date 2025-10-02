use tauri::generate_handler;
use device_query::{DeviceQuery, DeviceState, MouseState}; // 👈 importa el trait

#[tauri::command]
fn cursor_position() -> Result<serde_json::Value, String> {
    let device = DeviceState::new();
    let MouseState { coords, .. } = device.get_mouse(); // 👈 ahora compila
    let (x, y) = (coords.0 as i32, coords.1 as i32);
    Ok(serde_json::json!({ "x": x, "y": y }))
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(generate_handler![cursor_position])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
