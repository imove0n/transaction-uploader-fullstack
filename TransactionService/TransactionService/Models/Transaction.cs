using System;
using System.ComponentModel.DataAnnotations;

namespace TransactionService.Models
{
    public class Transaction
    {
        [Key]
        [MaxLength(20)]
        public string ReferenceNumber { get; set; }
        public long Quantity { get; set; }
        public decimal Amount { get; set; }
        [MaxLength(100)]
        public string Name { get; set; }
        public DateTime TransactionDate { get; set; }
        [MaxLength(5)]
        public string Symbol { get; set; }
        [MaxLength(4)]
        public string OrderSide { get; set; }
        [MaxLength(8)]
        public string OrderStatus { get; set; }
    }
}
