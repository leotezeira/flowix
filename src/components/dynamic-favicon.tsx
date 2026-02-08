'use client';

import { useEffect } from 'react';

export function DynamicFavicon() {
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const response = await fetch('/api/public/system-config');
        if (response.ok) {
          const data = await response.json();
          if (data.favicon) {
            // Remover favicon anterior si existe
            const existingLink = document.querySelector("link[rel='icon']");
            if (existingLink) {
              existingLink.remove();
            }

            // Crear y agregar nuevo favicon
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = data.favicon;
            link.type = 'image/x-icon';
            document.head.appendChild(link);
          }
        }
      } catch (error) {
        console.error('Error loading favicon:', error);
      }
    };

    loadFavicon();
  }, []);

  return null;
}
