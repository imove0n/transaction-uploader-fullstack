using System;
using System.ComponentModel.DataAnnotations;

namespace TransactionService.Models
{
    public class InvalidTransaction
    {
        [Key]
        public int Id { get; set; }
        public int LineNumber { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.Now;
    }
}
