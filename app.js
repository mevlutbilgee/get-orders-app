const store_url = "https://dopigo-development-store.myshopify.com/";
const api_key = "9663849bb738899a6d8147875ce99a4f";
const api_password = "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";
const api_url = "https://panel.dopigo.com/api/v1/orders/";
const api_token = "6a8e9a1493ec7c54c93fd0729c2c04edb78941b8";

const today = new Date();
const year = today.getFullYear(); // Yıl (YYYY)
const month = String(today.getMonth() + 1).padStart(2, "0"); // Ay (AA)
const day = String(today.getDate()).padStart(2, "0"); // Gün (GG)
const formattedDate = `${year}-${month}-${day}`;
// console.log(today);
console.log(formattedDate);
const tenDaysAgo = new Date(today);
tenDaysAgo.setDate(today.getDate() - 10);
const beforeTenDaysYear = tenDaysAgo.getFullYear(); // Yıl (YYYY)
const beforeTenDaysMonth = String(tenDaysAgo.getMonth() + 1).padStart( 2,"0"); // Ay (AA)
const beforeTenDays = String(tenDaysAgo.getDate()).padStart(2, "0"); // Gün (GG)
const tenDaysformattedDate = `${beforeTenDaysYear}-${beforeTenDaysMonth}-${beforeTenDays}`;
console.log(tenDaysformattedDate);

const created_at_max = formattedDate;
const created_at_min = tenDaysformattedDate;
// console.log(created_at_min);
async function getOrders() {
  const endpoint = `${store_url}/admin/api/2023-04/orders.json?status=any`;
  const response = await axios(endpoint, {
    auth: {
      username: api_key,
      password: api_password,
    },
    params: {
      created_at_min: created_at_min,
      created_at_max: created_at_max,
    },
  });
  const orders = response.data;
  return orders;
}

async function getDataFromApi() {
  const headers = {
    Authorization: `Token ${api_token}`,
  };
  const url = `https://panel.dopigo.com/api/v1/orders?service_date_after=${two_week_ago_str}&service_date_before=${today_str}`;
  const response = await axios.get(url, { headers });
  const data = response.data;
  return data;
}

async function postDataToApi(orderData) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${api_token}`,
  };

  try {
    const response = await axios.post(api_url, orderData, { headers });

    if (response.status === 200 || response.status === 201) {
      console.log("Veriler başarıyla gönderildi.");
      console.log("Response status code:", response.status);
    } else {
      console.log("Veri gönderimi başarısız oldu:", response.data);
      console.log("Hata kodu:", response.status);
    }
  } catch (error) {
    console.error("Veri gönderimi başarısız oldu:", error.message);
  }
}

async function putDataToApi(updateData, panelId) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${api_token}`,
  };
  const url = `https://panel.dopigo.com/api/v1/orders/${panelId}/`;

  try {
    const response = await axios.put(url, updateData, { headers });
    console.log("Put status code:", response.status);
  } catch (error) {
    console.error("Put işlemi başarısız oldu:", error.message);
  }
}

async function processOrders() {
  while (true) {
    let panel_index = 0;
    const orders = await getOrders();
    const service = 1;
    const service_name = "store";
    const sales_channel = "shopify";

    for (const order of orders.orders) {
      const order_id = order.id;
      const created_at = order.created_at;
      const email = order.contact_email;
      const order_number = order.order_number;
      const total_price = order.total_price;
      const discounted_price = order.total_discounts;
      const total_tax = order.total_tax;
      const paid = order.total_price_set.shop_money.amount;
      const line_items = order.line_items;
      const note = order.note;
      const financial_status = order.financial_status;
      let shipping_status = order.fulfillment_status;
      const shipping_address = order.shipping_address;
      const billing_address = order.billing_address;
      const default_address = order.customer.default_address;
      const shipping_price = order.total_shipping_price_set.shop_money.amount;
      // Örnek: Billing Address işlemleri
      const billing_name = billing_address.name;
      const billing_full_address = billing_address.address1;
      const billing_tckn_vkn = billing_address.address2;
      const billing_company = billing_address.company;
      const billing_phone = billing_address.phone;
      const billing_city = billing_address.city;
      const billing_district = billing_address.zip;
      const billing_province = billing_address.province;
      const billing_country = billing_address.count;

      // Örnek: Shipping Address işlemleri
      const shipping_name = shipping_address.name;
      const shipping_full_address = shipping_address.address1;
      const shipping_phone = shipping_address.phone;
      const shipping_city = shipping_address.city;
      const shipping_district = shipping_address.zip;
      const shipping_province = shipping_address.province;
      const shipping_country = shipping_address.country;

      // Örnek: Customer işlemleri
      const customer_name = default_address.name;
      const customer_full_address = default_address.address1;
      const customer_phone = default_address.phone;
      const customer_city = default_address.city;
      const customer_district = default_address.zip;
      const customer_province = default_address.province;
      const customer_country = default_address.country;

      // Aynı şekilde diğer işlemleri burada işleyebilirsiniz

      console.log("--------------------");
      console.log(`Order id: ${order_id}`);
      console.log(`Created At: ${created_at}`);
      console.log(`Service: ${service}`);
      console.log(`Service Name: ${service_name}`);
      console.log(`Sales channel: ${sales_channel}`);
      console.log(`Order Number: ${order_number}`);
      console.log(`Email: ${email}`);
      console.log(`Status: ${financial_status}`);
      console.log(`Shipping Status: ${shipping_status}`);
      console.log(`Total Price: ${total_price}`);
      console.log(`Discounted Price: ${discounted_price}`);
      console.log(`Total Tax: ${total_tax}`);
      console.log(`Paid: ${paid}`);

      if (shipping_status === "fulfilled") {
        shipping_status = "shipped";
      } else {
        shipping_status = "waiting_shipment";
      }

      if (financial_status === "refunded") {
        shipping_status = "cancelled";
      }

      let citizen_id = "";
      let tax_id = "";
      let tax_office = "";

      if (billing_tckn_vkn) {
        if (billing_tckn_vkn.length === 11 && /^\d+$/.test(billing_tckn_vkn)) {
          citizen_id = billing_tckn_vkn;
          account_type = "person";
          tax_id = null;
        } else if (
          billing_tckn_vkn.length > 11 &&
          /^\d+$/.test(billing_tckn_vkn)
        ) {
          account_type = "person";
          tax_id = null;
          citizen_id = billing_tckn_vkn.slice(0, 11);
        } else {
          tax_id = "";
          tax_office = "";
          for (const char of billing_tckn_vkn) {
            if (!isNaN(char)) {
              tax_id += char;
            } else {
              tax_office += char;
            }
          }
          account_type = "company";
          citizen_id = null;
        }
      } else {
        citizen_id = "11111111111";
        tax_id = null;
        account_type = "person";
      }

      const company_name = billing_company || "";

      const data = await getDataFromApi();
      const panel_id_list = data.results.map((result) => result.items[0].order);
      let found = false;

      for (const result of data.results) {
        if (result.service_value === String(order_id)) {
          found = true;
          break;
        }
      }

      if (!found) {
        const order_data = {
          service: service,
          service_name: service_name,
          sales_channel: sales_channel,
          service_created: created_at,
          service_value: order_id,
          service_order_id: order_id,
          customer: {
            account_type: account_type,
            full_name: customer_name,
            address: {
              full_address: customer_full_address,
              contact_full_name: customer_name,
              contact_phone_number: customer_phone,
              city: customer_city,
              district: customer_district,
              zip_code: null,
            },
            email: email,
            phone_number: customer_phone,
            citizen_id: citizen_id,
            tax_id: tax_id,
            tax_office: tax_office,
            company_name: company_name,
          },
          billing_address: {
            full_address: billing_full_address,
            contact_full_name: billing_name,
            contact_phone_number: billing_phone,
            city: billing_city,
            district: billing_district,
            zip_code: null,
          },
          shipping_address: {
            full_address: shipping_full_address,
            contact_full_name: shipping_name,
            contact_phone_number: shipping_phone,
            city: shipping_city,
            district: shipping_district,
            zip_code: null,
          },
          shipped_date: null,
          payment_type: "undefined",
          status: shipping_status,
          total: total_price,
          service_fee: null,
          discount: discounted_price,
          archived: false,
          notes: note,
          items: [],
        };

        for (const item of line_items) {
          const item_sku = item.sku;
          const item_id = item.id;
          const item_name = item.title;
          const item_amount = parseInt(item.quantity);
          const unit_discount =
            item.discount_allocations.length > 0
              ? parseFloat(item.discount_allocations[0].amount)
              : 0;
          const item_unit_price = parseFloat(item.price);
          const item_price = item_unit_price * item_amount - unit_discount;
          const tax_lines = item.tax_lines[0].rate;
          const rate = parseInt(tax_lines * 100);

          const item_data = {
            service_item_id: item_id,
            service_product_id: item_id,
            service_shipment_code: order_id,
            sku: item_sku,
            attributes: "",
            name: item_name,
            amount: item_amount,
            price: item_price,
            unit_price: item_unit_price,
            shipment: null,
            shipment_campaign_code: null,
            buyer_pays_shipment: false,
            status: shipping_status,
            shipment_provider: null,
            tax_ratio: rate,
            product: {
              sku: item_sku,
            },
            vat: rate,
          };

          order_data.items.push(item_data);
        }

        if (parseFloat(shipping_price) > 0) {
          const shipping_product = {
            service_item_id: `${order_id}-2`,
            service_product_id: `${order_id}-1`,
            service_shipment_code: `${order_id}-1`,
            sku: "KARGO-BEDELI",
            attributes: "",
            name: "Kargo Bedeli",
            amount: 1,
            price: shipping_price,
            unit_price: shipping_price,
            shipment: null,
            shipment_campaign_code: null,
            buyer_pays_shipment: true,
            status: "shipped",
            shipment_provider: null,
            tax_ratio: 20,
            product: {
              sku: null,
            },
            vat: 20,
          };

          order_data.items.push(shipping_product);
        }

        await postDataToApi(order_data);
      } else {
        console.log("Veri mevcut, güncelleniyor.");
        let panelId = panel_id_list[panel_index];
        panel_index = panel_index + 1;

        const update_data = {
          service: service,
          service_name: service_name,
          sales_channel: sales_channel,
          service_created: created_at,
          service_value: order_id,
          service_order_id: order_id,
          customer: {
            account_type: account_type,
            full_name: customer_name,
            address: {
              full_address: customer_full_address,
              contact_full_name: customer_name,
              contact_phone_number: customer_phone,
              city: customer_city,
              district: customer_district,
              zip_code: null,
            },
            email: email,
            phone_number: customer_phone,
            citizen_id: citizen_id,
            tax_id: tax_id,
            tax_office: tax_office,
            company_name: company_name,
          },
          billing_address: {
            full_address: billing_full_address,
            contact_full_name: billing_name,
            contact_phone_number: billing_phone,
            city: billing_city,
            district: billing_district,
            zip_code: null,
          },
          shipping_address: {
            full_address: shipping_full_address,
            contact_full_name: shipping_name,
            contact_phone_number: shipping_phone,
            city: shipping_city,
            district: shipping_district,
            zip_code: null,
          },
          shipped_date: null,
          payment_type: "undefined",
          status: shipping_status,
          total: total_price,
          service_fee: null,
          discount: discounted_price,
          archived: false,
          notes: note,
          items: [],
        };

        for (const item of line_items) {
          const item_sku = item.sku;
          const item_id = item.id;
          const item_name = item.title;
          const item_amount = parseInt(item.quantity);
          const unit_discount =
            item.discount_allocations.length > 0
              ? parseFloat(item.discount_allocations[0].amount)
              : 0;
          const item_unit_price = parseFloat(item.price);
          const item_price = item_unit_price * item_amount - unit_discount;
          const tax_lines = item.tax_lines[0].rate;
          const rate = parseInt(tax_lines * 100);

          const item_data = {
            service_item_id: item_id,
            service_product_id: item_id,
            service_shipment_code: order_id,
            sku: item_sku,
            attributes: "",
            name: item_name,
            amount: item_amount,
            price: item_price,
            unit_price: item_unit_price,
            shipment: null,
            shipment_campaign_code: null,
            buyer_pays_shipment: false,
            status: shipping_status,
            shipment_provider: null,
            tax_ratio: rate,
            product: {
              sku: item_sku,
            },
            vat: rate,
          };

          update_data.items.push(item_data);
        }

        if (parseFloat(shipping_price) > 0) {
          const shipping_product = {
            service_item_id: `${order_id}-1`,
            service_product_id: `${order_id}-1`,
            service_shipment_code: `${order_id}-1`,
            sku: "KARGO-BEDELI",
            attributes: "",
            name: "Kargo Bedeli",
            amount: 1,
            price: shipping_price,
            unit_price: shipping_price,
            shipment: null,
            shipment_campaign_code: null,
            buyer_pays_shipment: true,
            status: "shipped",
            shipment_provider: null,
            tax_ratio: 20,
            product: {
              sku: null,
            },
            vat: 20,
          };

          update_data.items.push(shipping_product);
        }

        putDataToApi(update_data, panelId);
      }

      setTimeout(processOrders, 600000); // 10 dakika beklenir
    }
  }
}

// processOrders();
