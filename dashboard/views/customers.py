import streamlit as st
from services.api_client import get_api_client

def render_customers_view():
    client = get_api_client()

    st.markdown(
        """
        <div style="margin-bottom: 20px;">
            <h1 class="page-title">Customer Accounts & Facility Sites</h1>
            <p class="page-subtitle">Directory of managed commercial facilities, contact information, SLA tiers, and service history.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # 1. Add Customer Form
    with st.expander("➕ Register New Customer Facility", expanded=False):
        with st.form("add_customer_form", clear_on_submit=True):
            c1, c2 = st.columns(2)
            with c1:
                name = st.text_input("Facility / Client Name *", placeholder="e.g. Apex Data Center")
                company = st.text_input("Parent Organization", placeholder="Apex Technologies Inc")
                email = st.text_input("Contact Email *", placeholder="facilities@apexdatacenter.com")
                phone = st.text_input("Emergency Phone *", placeholder="+1-408-555-8900")
            with c2:
                address = st.text_input("Physical Service Address *", placeholder="500 Technology Way")
                city = st.text_input("City", value="San Jose")
                state = st.text_input("State", value="CA")
                postal = st.text_input("Postal Code", value="95110")

            notes = st.text_area("Site Access Instructions & Security Clearances", placeholder="Keycard required at Guard Station 2. 2-Hour SLA contract.")

            sub_cust = st.form_submit_button("Register Customer Site", use_container_width=True)
            if sub_cust:
                if not name or not email or not phone or not address:
                    st.error("Please fill in all mandatory fields (Name, Email, Phone, Address).")
                else:
                    res = client.create_customer({
                        "name": name.strip(),
                        "company": company.strip() if company else None,
                        "email": email.strip().lower(),
                        "phone": phone.strip(),
                        "address": address.strip(),
                        "city": city.strip(),
                        "state": state.strip(),
                        "postalCode": postal.strip(),
                        "notes": notes.strip() if notes else None,
                    })
                    if res.get("success"):
                        st.success(f"Customer site **{name}** registered successfully!")
                        st.rerun()
                    else:
                        st.error(f"Failed to register customer: {res.get('error')}")

    # 2. Search & Customer List
    search = st.text_input("Search Customers", placeholder="Search by facility name, company, email, or city...")
    customers = client.list_customers(search=search if search.strip() else None)

    st.markdown(f"<div style='font-size:0.875rem; color:#64748b; margin-bottom:14px;'><strong>{len(customers)}</strong> managed customer accounts</div>", unsafe_allow_html=True)

    if not customers:
        st.info("No customer sites matched the search.")
        return

    cols = st.columns(2)
    for idx, cust in enumerate(customers):
        col = cols[idx % 2]
        with col:
            job_count = cust.get("_count", {}).get("jobs", 0)
            notes_snippet = cust.get("notes") or "No special access restrictions noted."

            st.markdown(
                f"""
                <div class="ff-card">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                        <div>
                            <h3 style="font-size:1.1rem; font-weight:700; margin:0; color:#0f172a;">{cust.get("name")}</h3>
                            <div style="font-size:0.8rem; color:#64748b;">{cust.get("company") or "Independent Account"}</div>
                        </div>
                        <span style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; font-size:0.75rem; font-weight:600; padding:2px 8px; border-radius:4px;">
                            {job_count} Jobs Logged
                        </span>
                    </div>
                    <div style="font-size:0.825rem; color:#334155; line-height:1.6; margin-bottom:10px;">
                        <div>📞 {cust.get("phone")} • ✉️ {cust.get("email")}</div>
                        <div>📍 {cust.get("address")}, {cust.get("city")}, {cust.get("state")} {cust.get("postalCode")}</div>
                    </div>
                    <div style="background:#f8fafc; border:1px solid #f1f5f9; border-radius:6px; padding:8px 12px; font-size:0.775rem; color:#64748b; font-style:italic;">
                        "{notes_snippet[:130]}..."
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            if st.button(f"Dispatch Job to {cust.get('name')}", key=f"disp_cust_{cust['id']}", use_container_width=True):
                st.session_state["active_view"] = "jobs"
                st.session_state["show_create_job"] = True
                st.rerun()
