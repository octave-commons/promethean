#!/usr/bin/env python3
import json
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
import threading
import time

# Mock data
sessions = [
    {
        'id': 'session-1',
        'title': 'Project Setup',
        'description': 'Initial project configuration and setup',
        'createdAt': '2024-01-15T10:00:00Z',
        'updatedAt': '2024-01-15T10:00:00Z',
        'status': {'name': 'active'},
        'messages': []
    },
    {
        'id': 'session-2',
        'title': 'Feature Development',
        'description': 'Working on new feature implementation',
        'createdAt': '2024-01-14T15:30:00Z',
        'updatedAt': '2024-01-14T15:30:00Z',
        'status': {'name': 'active'},
        'messages': []
    }
]

next_id = 3

class MockOpenCodeHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if self.path == '/' or self.path == '/api' or self.path == '/api/v1':
            response = {
                'name': 'Mock OpenCode Server',
                'version': '1.0.0',
                'endpoints': [
                    'GET /api/v1/sessions',
                    'POST /api/v1/sessions',
                    'GET /api/v1/sessions/:id',
                    'DELETE /api/v1/sessions/:id'
                ]
            }
        elif self.path == '/api/v1/sessions' or self.path == '/sessions':
            response = {'sessions': sessions}
        elif self.path.startswith('/sessions/') or self.path.startswith('/api/v1/sessions/'):
            session_id = self.path.split('/')[-1]
            session = next((s for s in sessions if s['id'] == session_id), None)
            if session:
                response = session
            else:
                self.send_error(404, 'Session not found')
                return
        else:
            self.send_error(404, 'Not found')
            return
        
        self.wfile.write(json.dumps(response, indent=2).encode())

    def do_POST(self):
        global next_id
        
        content_length = int(self.headers['Content-Length'] or 0)
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode()) if post_data else {}
        except json.JSONDecodeError:
            data = {}
        
        self.send_response(201)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if self.path == '/api/v1/sessions' or self.path == '/sessions':
            new_session = {
                'id': f'session-{next_id}',
                'title': data.get('title', 'New Session'),
                'description': data.get('description', ''),
                'createdAt': '2024-01-15T11:00:00Z',
                'updatedAt': '2024-01-15T11:00:00Z',
                'status': {'name': 'active'},
                'messages': []
            }
            sessions.append(new_session)
            next_id += 1
            response = new_session
        else:
            self.send_error(404, 'Not found')
            return
        
        self.wfile.write(json.dumps(response, indent=2).encode())

    def do_DELETE(self):
        if self.path.startswith('/sessions/') or self.path.startswith('/api/v1/sessions/'):
            session_id = self.path.split('/')[-1]
            global sessions
            original_length = len(sessions)
            sessions = [s for s in sessions if s['id'] != session_id]
            
            if len(sessions) < original_length:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {'deleted': True, 'session_id': session_id}
                self.wfile.write(json.dumps(response, indent=2).encode())
            else:
                self.send_error(404, 'Session not found')
        else:
            self.send_error(404, 'Not found')

    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format%args}")

if __name__ == '__main__':
    PORT = 4096
    with socketserver.TCPServer(("", PORT), MockOpenCodeHandler) as httpd:
        print(f"🚀 Mock OpenCode Server running on http://localhost:{PORT}")
        print("Available endpoints:")
        print("  GET    /api/v1/sessions        - List all sessions")
        print("  POST   /api/v1/sessions        - Create new session")
        print("  GET    /api/v1/sessions/:id     - Get session details")
        print("  DELETE /api/v1/sessions/:id     - Delete session")
        httpd.serve_forever()