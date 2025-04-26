// components/LoadingCard.jsx
const LoadingCard = ({ t }) => {
    return (
      <div className="card">
        <div className="card-body text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-3">
            {t("product.loading_product_history")}...
          </h5>
        </div>
      </div>
    );
  };
  
  export default LoadingCard;
  
  