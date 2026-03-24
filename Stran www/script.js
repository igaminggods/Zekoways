// Smooth scroll for internal links
document.addEventListener('click', function(e){
	const target = e.target.closest('a[href^="#"]');
	if(!target) return;
	const id = target.getAttribute('href');
	const el = document.querySelector(id);
	if(!el) return;
	e.preventDefault();
	el.scrollIntoView({behavior:'smooth', block:'start'});
});

// Current year in footer
document.addEventListener('DOMContentLoaded', function(){
	const yearEl = document.getElementById('year');
	if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

	// Progressive logo loader: tries multiple folders and extensions
	const tryOrder = ['webp','png','jpg','jpeg'];
	const tryDirs = ['img/','stran 22/img/','stran%2022/img/','Stran 22/img/','Stran%2022/img/'];
	const logos = document.querySelectorAll('img[data-logo-base]');
	logos.forEach(function(img){
		const base = img.getAttribute('data-logo-base');
		if(!base) return;
		let idx = 0;
		let dirIdx = 0;
		function tryNext(){
			if(dirIdx >= tryDirs.length) return; // give up silently
			if(idx >= tryOrder.length){ idx = 0; dirIdx++; }
			if(dirIdx >= tryDirs.length) return;
			const ext = tryOrder[idx++];
			const url = tryDirs[dirIdx] + base + '.' + ext;
			const test = new Image();
			test.onload = function(){ img.src = url; };
			test.onerror = tryNext;
			test.src = url;
		}
		tryNext();
	});

	// Newsletter / giveaway signup (client-side only)
	const form = document.getElementById('newsletter-form');
	if(form){
		const emailEl = document.getElementById('newsletter-email');
		const resultEl = document.getElementById('newsletter-result');

		function setResult(type, message){
			if(!resultEl) return;
			resultEl.classList.remove('is-ok','is-err');
			if(type === 'ok') resultEl.classList.add('is-ok');
			if(type === 'err') resultEl.classList.add('is-err');
			resultEl.textContent = message || '';
		}

		function isValidEmail(value){
			// Basic validation: sufficient for UI feedback, not for server-side enforcement.
			return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value || '').trim());
		}

		form.addEventListener('submit', async function(e){
			e.preventDefault();
			const email = emailEl ? emailEl.value.trim() : '';
			if(!emailEl) return;

			if(!isValidEmail(email)){
				emailEl.setAttribute('aria-invalid','true');
				setResult('err','Please enter a valid email address to join.');
				emailEl.focus();
				return;
			}

			emailEl.removeAttribute('aria-invalid');
			setResult('', '');

			const submitBtn = form.querySelector('button[type="submit"]');
			const prevBtnText = submitBtn ? submitBtn.textContent : '';
			if(submitBtn) {
				submitBtn.disabled = true;
				submitBtn.textContent = 'Joining...';
			}

			try{
				const resp = await fetch('/api/newsletter', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, source: 'giveaways' })
				});
				const data = await resp.json().catch(function(){ return {}; });
				if(!resp.ok || !data.ok){
					throw new Error((data && data.error) ? data.error : 'Signup failed');
				}

				setResult('ok','You’re in! Watch your inbox for giveaway announcements.');
				form.reset();
			}catch(err){
				setResult('err','Could not join right now. Please try again in a moment.');
			}finally{
				if(submitBtn) {
					submitBtn.disabled = false;
					submitBtn.textContent = prevBtnText || 'Join newsletter';
				}
			}
		});
	}
});

// Track play button clicks (placeholder for analytics)
document.addEventListener('click', function(e){
	const btn = e.target.closest('.js-play-btn');
	if(!btn) return;
	const casinoName = btn.getAttribute('data-casino') || 'Unknown';
	console.log('Play click:', casinoName);
});


