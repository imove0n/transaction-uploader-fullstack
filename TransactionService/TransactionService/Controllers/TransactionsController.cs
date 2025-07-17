using System.Globalization;
using Microsoft.AspNetCore.Http;
using System.IO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransactionService.Data;
using TransactionService.Models;

namespace TransactionService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionsController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET: api/Transactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
        {
            return await _context.Transactions.ToListAsync();
        }

        // ✅ GET: api/Transactions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(string id)
        {
            var transaction = await _context.Transactions.FindAsync(id);

            if (transaction == null)
            {
                return NotFound();
            }

            return transaction;
        }

        // ✅ PUT: api/Transactions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTransaction(string id, Transaction transaction)
        {
            if (id != transaction.ReferenceNumber)
            {
                return BadRequest();
            }

            _context.Entry(transaction).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TransactionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // ✅ POST: api/Transactions
        [HttpPost]
        public async Task<ActionResult<Transaction>> PostTransaction(Transaction transaction)
        {
            _context.Transactions.Add(transaction);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (TransactionExists(transaction.ReferenceNumber))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetTransaction", new { id = transaction.ReferenceNumber }, transaction);
        }

        // ✅ DELETE: api/Transactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(string id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TransactionExists(string id)
        {
            return _context.Transactions.Any(e => e.ReferenceNumber == id);
        }

        // ✅ NEW: Upload CSV Endpoint (Full Validation + 8 Columns Support + Invalid Record Logging)
        [HttpPost("UploadCsv")]
        public async Task<IActionResult> UploadCsv(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { Message = "No file uploaded." });

            if (file.Length > 1024 * 1024) // 1 MB limit
                return BadRequest(new { Message = "File size exceeds 1 MB." });

            var transactions = new List<Transaction>();
            var invalidRecords = new List<string>();

            using (var reader = new StreamReader(file.OpenReadStream()))
            {
                int lineNumber = 0;
                while (!reader.EndOfStream)
                {
                    var line = await reader.ReadLineAsync();
                    lineNumber++;

                    if (string.IsNullOrWhiteSpace(line)) continue;

                    var columns = line.Split(',');

                    if (columns.Length != 8)
                    {
                        invalidRecords.Add($"Line {lineNumber}: Invalid column count (must be 8 columns).");
                        continue;
                    }

                    try
                    {
                        var referenceNumber = columns[0].Trim();
                        var quantity = long.Parse(columns[1]);
                        var amount = decimal.Parse(columns[2]);
                        var name = columns[3].Trim();
                        var transactionDate = DateTime.ParseExact(columns[4].Trim(), "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture);
                        var symbol = columns[5].Trim();
                        var orderSide = columns[6].Trim();
                        var orderStatus = columns[7].Trim();

                        // ✅ Validation Rules
                        if (string.IsNullOrWhiteSpace(referenceNumber) || referenceNumber.Length > 20 || !referenceNumber.All(char.IsLetterOrDigit))
                        {
                            invalidRecords.Add($"Line {lineNumber}: Invalid ReferenceNumber.");
                            continue;
                        }

                        if (transactions.Any(t => t.ReferenceNumber == referenceNumber) || _context.Transactions.Any(t => t.ReferenceNumber == referenceNumber))
                        {
                            invalidRecords.Add($"Line {lineNumber}: Duplicate ReferenceNumber.");
                            continue;
                        }

                        if (string.IsNullOrWhiteSpace(name))
                        {
                            invalidRecords.Add($"Line {lineNumber}: Name is required.");
                            continue;
                        }

                        if (symbol.Length < 3 || symbol.Length > 5 || !symbol.All(char.IsLetterOrDigit))
                        {
                            invalidRecords.Add($"Line {lineNumber}: Invalid Symbol.");
                            continue;
                        }

                        if (orderSide != "Buy" && orderSide != "Sell")
                        {
                            invalidRecords.Add($"Line {lineNumber}: OrderSide must be Buy or Sell.");
                            continue;
                        }

                        if (orderStatus != "Open" && orderStatus != "Matched" && orderStatus != "Cancelled")
                        {
                            invalidRecords.Add($"Line {lineNumber}: Invalid OrderStatus.");
                            continue;
                        }

                        transactions.Add(new Transaction
                        {
                            ReferenceNumber = referenceNumber,
                            Quantity = quantity,
                            Amount = amount,
                            Name = name,
                            TransactionDate = transactionDate,
                            Symbol = symbol,
                            OrderSide = orderSide,
                            OrderStatus = orderStatus
                        });
                    }
                    catch (Exception ex)
                    {
                        invalidRecords.Add($"Line {lineNumber}: {ex.Message}");
                    }
                }
            }

            // ✅ Save invalid records to separate table if any
            if (invalidRecords.Count > 0)
            {
                foreach (var error in invalidRecords)
                {
                    var parts = error.Split(':');
                    int line = 0;
                    if (parts.Length > 1)
                        int.TryParse(parts[0].Replace("Line", "").Trim(), out line);

                    string message = string.Join(":", parts.Skip(1)).Trim();

                    _context.InvalidTransactions.Add(new InvalidTransaction
                    {
                        LineNumber = line,
                        ErrorMessage = message
                    });
                }

                await _context.SaveChangesAsync();

                return BadRequest(new { Message = "File contains invalid records. File rejected.", Errors = invalidRecords });
            }

            // ✅ Save valid transactions if no errors
            _context.Transactions.AddRange(transactions);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "File uploaded successfully.", RecordsInserted = transactions.Count });
        }

        // ✅ NEW: Get Invalid Transactions for Frontend
        [HttpGet("/api/InvalidTransactions")]
        public async Task<IActionResult> GetInvalidTransactions()
        {
            var invalid = await _context.InvalidTransactions
                .OrderByDescending(i => i.UploadedAt)
                .ToListAsync();

            return Ok(invalid);
        }
    }
}
