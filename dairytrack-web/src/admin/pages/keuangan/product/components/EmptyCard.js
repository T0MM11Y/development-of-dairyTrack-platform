// components/EmptyDataCard.jsx
const EmptyDataCard = ({ t }) => {
    return (
      <div className="card">
        <div className="card-body text-center p-5">
          <i className="bx bx-info-circle font-size-24 text-muted"></i>
          <h5 className="mt-3">{t("product.no_product_history")}</h5>
        </div>
      </div>
    );
  };
  
  export default EmptyDataCard;