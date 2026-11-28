import React from "react";

export default function StructuredData() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://www.purohitsetu.in/#organization",
        name: "PurohitSetu - North Indian Hindi Vedic Pandits in Bengaluru",
        url: "https://www.purohitsetu.in",
        logo: "https://www.purohitsetu.in/pandit-logo.png",
        telephone: "+91-9449871293",
        email: "support.purohitsetu@gmail.com",
        priceRange: "₹1100 - ₹11000",
        description:
          "Book verified North Indian, Hindi, Maithili, and Bhojpuri speaking Vedic Pandits in Bengaluru for Griha Pravesh, Satyanarayan Katha, Vivah, Rudrabhishek, and Vastu Shanti Puja.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Ekadanta Layout, Parappana Agrahara, Electronic City",
          addressLocality: "Bengaluru",
          addressRegion: "Karnataka",
          postalCode: "560100",
          addressCountry: "IN",
        },
        areaServed: [
          "Whitefield",
          "HSR Layout",
          "Koramangala",
          "Indiranagar",
          "Electronic City",
          "Marathahalli",
          "Sarjapur Road",
          "Bellandur",
          "JP Nagar",
          "Jayanagar",
          "Hebbal",
          "Yelahanka",
          "BTM Layout",
        ],
        knowsLanguage: ["Hindi", "Sanskrit", "Bhojpuri", "Maithili"],
      },
      {
        "@type": "Service",
        serviceType: "North Indian Hindi Vedic Pandit Booking in Bengaluru",
        provider: {
          "@id": "https://www.purohitsetu.in/#organization",
        },
        areaServed: {
          "@type": "City",
          name: "Bengaluru",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "North Indian Vedic Puja Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Griha Pravesh & Vastu Shanti Puja (Hindi Vidhi)",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Satyanarayan Bhagwan Katha & Puja",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Rudrabhishek Pooja & Shiva Hawan",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Vedic Vivah (North Indian Marriage Sanskar)",
              },
            },
          ],
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Do PurohitSetu Pandits perform puja in Hindi in Bengaluru?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, PurohitSetu exclusively provides Gurukul-trained North Indian Vedic Pandits in Bengaluru who conduct rituals in Hindi, Sanskrit, Maithili, and Bhojpuri with clear explanation of mantras.",
            },
          },
          {
            "@type": "Question",
            name: "Does the Pandit bring complete Puja & Hawan Samagri?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, you can select the Complete Hawan & Samagri Kit option while booking, and our Acharya will bring authentic Mango wood, herbs, pure ghee, and Gangajal.",
            },
          },
          {
            "@type": "Question",
            name: "How do I book a Hindi Pandit in Bengaluru on PurohitSetu?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Fill out the quick booking form on purohitsetu.in with your area, puja date, and ritual name, or click Book via WhatsApp for instant Shubh Muhurat and booking confirmation.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}