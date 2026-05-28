import React from 'react'
import "./Footer.css"
export default function Footer() {
    return (
        <div className='footer-box'>
            <p>Questions? Contact us.</p>
            <div className='footer-content'>
                <div>
                    <ul>
                        <li>FAQ</li>
                        <li>Investor Relations</li>
                        <li>Privacy</li>
                        <li>Speed Up</li>
                    </ul>
                </div>
                <div>
                    <ul>
                        <li>
                            Help Center</li>
                        <li>
                            Jobs</li>
                        <li>
                            Cookie Preferences</li>
                        <li>
                            Legal Notices</li>
                    </ul>
                </div>
                <div>
                    <ul>
                        <li>
                            Account</li>
                        <li>
                            Ways to Watch</li>
                        <li>
                            Corporate Information</li>
                        <li>Only on Netflix
                        </li>
                    </ul>
                </div>
                <div>
                    <ul>
                        <li>
                            Media Center</li>
                        <li>
                            Terms of Use</li>
                        <li>
                            Contact Us</li>
                        <li>Speed Up</li>
                    </ul>
                </div>
            </div>
            <div className='footer-last'>
                <select name="language" id='select-options'>
                <option value="en">English</option>

                 </select>
                  <p>Netflix Pakistan</p>
                  <p style={{fontSize:"14px"}}>This page is protected by Google reCAPTCHA to ensure you're not a bot. Learn more.</p>
            </div>
        </div>
    )
}
